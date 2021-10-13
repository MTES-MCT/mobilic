import React from "react";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import { isPendingSubmission, useStoreSyncedWithLocalStorage } from "./store";
import { useApi } from "./api";
import { ACTIVITIES, parseActivityPayloadFromBackend } from "./activities";
import { parseMissionPayloadFromBackend } from "./mission";
import {
  formatNameInGqlError,
  graphQLErrorMatchesCode,
  isGraphQLError
} from "./errors";
import {
  formatDay,
  formatTimeOfDay,
  now,
  sameMinute,
  truncateMinute
} from "./time";
import { formatPersonName } from "./coworkers";
import {
  editUserExpenditures,
  EXPENDITURES,
  regroupExpendituresSpendingDateByType
} from "./expenditures";
import { useSnackbarAlerts } from "../../web/common/Snackbar";
import { useModals } from "./modals";
import {
  buildLogLocationPayloadFromAddress,
  CANCEL_ACTIVITY_MUTATION,
  CANCEL_COMMENT_MUTATION,
  CANCEL_EXPENDITURE_MUTATION,
  CREATE_MISSION_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  END_MISSION_MUTATION,
  LOG_ACTIVITY_MUTATION,
  LOG_COMMENT_MUTATION,
  LOG_EXPENDITURE_MUTATION,
  LOG_LOCATION_MUTATION,
  REGISTER_KILOMETER_AT_LOCATION,
  UPDATE_MISSION_VEHICLE_MUTATION,
  VALIDATE_MISSION_MUTATION
} from "./apiQueries";

const ActionsContext = React.createContext(() => {});

class Actions {
  constructor(store, api, modals, alerts) {
    this.store = store;
    this.api = api;
    this.modals = modals;
    this.alerts = alerts;

    api.registerResponseHandler("logActivity", {
      onSuccess: (
        apiResponse,
        { activityId: tempActivityId, requestId, switchMode, endTime }
      ) => {
        const activity = parseActivityPayloadFromBackend(
          apiResponse.data.activities.logActivity
        );
        if (switchMode) {
          this.store.dispatchUpdateAction(
            prevState => {
              const previousActivity = values(prevState.activities)
                .map(this.store.resolveLastVersionOfItem)
                .filter(Boolean)
                .find(
                  a =>
                    a.userId === activity.userId &&
                    a.id !== tempActivityId &&
                    isPendingSubmission(a) &&
                    a.pendingUpdates.some(
                      upd =>
                        upd.type === "update" && upd.requestId === requestId
                    )
                );
              return previousActivity
                ? {
                    activities: {
                      ...prevState.activities,
                      [previousActivity.id.toString()]: {
                        ...previousActivity,
                        endTime: activity.startTime
                      }
                    }
                  }
                : {};
            },
            ["activities"]
          );
        }
        this.store.addToIdentityMap(tempActivityId, activity.id);
        if (!endTime) {
          this.store.updateEntityObject({
            objectId: activity.missionId,
            entity: "missions",
            update: { ended: false }
          });
        }
        this.store.createEntityObject(activity, "activities");
      },
      onError: async (
        error,
        {
          actualUserId,
          requestId,
          activityId: tempActivityId,
          type,
          forceKillSisterActivitiesOnFail,
          groupId,
          startTime
        }
      ) => {
        // If the log-activity event raises an API error we cancel all the pending requests for the activity
        let requestsToCancel = this.store
          .pendingRequests()
          .filter(
            req =>
              (req.variables && req.variables.activityId === tempActivityId) ||
              (req.storeInfo && req.storeInfo.activityId === tempActivityId)
          );
        // If the activity should not be submitted for team mates because it failed for the main user, cancel the corresponding requests
        if (forceKillSisterActivitiesOnFail && groupId) {
          let otherRequestsToCancel = this.store
            .pendingRequests()
            .filter(
              req => req.groupId === groupId && req.requestId !== requestId
            );
          // We should also cancel further requests concerning these non submitted activities
          const activityIds = otherRequestsToCancel.map(
            req => req.storeInfo.activityId
          );
          otherRequestsToCancel = [
            ...otherRequestsToCancel,
            ...this.store
              .pendingRequests()
              .filter(
                req =>
                  req.variables &&
                  req.variables.activityId &&
                  activityIds.includes(req.variables.activityId)
              )
          ];
          requestsToCancel = [...requestsToCancel, ...otherRequestsToCancel];
        }

        if (isGraphQLError(error)) {
          const user =
            actualUserId === this.store.userId()
              ? this.store.userInfo()
              : this.store.getEntity("coworkers")[actualUserId.toString()];
          this.displayApiErrors({
            graphQLErrors: error.graphQLErrors,
            actionDescription: `L'activité ${
              ACTIVITIES[type].label
            } de ${formatPersonName(user)} à ${formatTimeOfDay(startTime)}`,
            isActionDescriptionFemale: true,
            overrideFormatGraphQLError: gqlError => {
              return this.formatLogActivityError(
                gqlError,
                user,
                this.store.userId()
              );
            },
            hasRequestFailed: true,
            shouldProposeRefresh:
              this.store.userId() === actualUserId &&
              this.shouldProposeRefresh(error)
          });
        }
        await Promise.all(
          requestsToCancel.map(req => this.store.clearPendingRequest(req))
        );
      }
    });

    api.registerResponseHandler("cancelOrEditActivity", {
      onSuccess: (apiResponse, { activityId, shouldCancel, newEndTime }) => {
        if (shouldCancel) {
          if (apiResponse.data.activities.cancelActivity.success) {
            this.store.deleteEntityObject(activityId, "activities");
          }
        } else {
          const activity = parseActivityPayloadFromBackend(
            apiResponse.data.activities.editActivity
          );
          if (!newEndTime)
            this.store.updateEntityObject({
              objectId: activity.missionId,
              entity: "missions",
              update: { ended: false }
            });
          this.store.updateEntityObject({
            objectId: activity.id,
            entity: "activities",
            update: activity,
            createOrReplace: true
          });
        }
      },
      onError: (error, { userId, type }) => {
        const selfId = this.store.userId();
        const user =
          userId === selfId
            ? this.store.userInfo()
            : this.store.getEntity("coworkers")[userId.toString()];
        if (isGraphQLError(error)) {
          this.displayApiErrors({
            graphQLErrors: error.graphQLErrors,
            actionDescription: `La correction de l'activité ${
              ACTIVITIES[type].label
            } de ${formatPersonName(user)}`,
            overrideFormatGraphQLError: gqlError => {
              return this.formatLogActivityError(gqlError, user, selfId);
            },
            hasRequestFailed: true,
            shouldProposeRefresh:
              selfId === userId && this.shouldProposeRefresh(error),
            isActionDescriptionFemale: true
          });
        }
      }
    });

    api.registerResponseHandler("beginMission", {
      onSuccess: (apiResponse, { missionId: tempMissionId }) => {
        const mission = apiResponse.data.activities.createMission;
        this.store.addToIdentityMap(tempMissionId, mission.id);
        this.store.updateEntityObject({
          objectId: tempMissionId,
          entity: "missions",
          update: parseMissionPayloadFromBackend(
            { ...mission, ended: false },
            this.store.userId()
          ),
          createOrReplace: true
        });
        this.store.dispatchUpdateAction(
          prevState => ({
            activities: mapValues(prevState.activities, a => ({
              ...a,
              missionId:
                a.missionId === tempMissionId ? mission.id : a.missionId
            }))
          }),
          ["activities"]
        );
        this.store.dispatchUpdateAction(
          prevState => ({
            expenditures: mapValues(prevState.expenditures, e => ({
              ...e,
              missionId:
                e.missionId === tempMissionId ? mission.id : e.missionId
            }))
          }),
          ["expenditures"]
        );
      },
      onError: async (error, { missionId: tempMissionId }) => {
        // If the begin-mission event raises an API error we cancel all the pending requests for the mission
        const pendingMissionRequests = this.store
          .pendingRequests()
          .filter(
            req =>
              (req.variables && req.variables.missionId === tempMissionId) ||
              (req.storeInfo && req.storeInfo.missionId === tempMissionId)
          );
        await Promise.all(
          pendingMissionRequests.map(req => this.store.clearPendingRequest(req))
        );
        this.store.deleteEntityObject(tempMissionId, "missions");
      }
    });

    api.registerResponseHandler("endMission", {
      onSuccess: apiResponse => {
        const mission = apiResponse.data.activities.endMission;
        this.store.updateEntityObject({
          objectId: mission.id,
          entity: "missions",
          update: { ...parseMissionPayloadFromBackend(mission), ended: true },
          createOrReplace: true
        });
        this.store.syncEntity(
          mission.activities.map(parseActivityPayloadFromBackend),
          "activities",
          a => a.missionId === mission.id
        );
      },
      onError: (error, { userId, missionId, currentActivityId, name }) => {
        if (
          isGraphQLError(error) &&
          error.graphQLErrors.some(gqle =>
            graphQLErrorMatchesCode(gqle, "MISSION_ALREADY_ENDED")
          )
        ) {
          const missionEndTime = error.graphQLErrors.find(gqle =>
            graphQLErrorMatchesCode(gqle, "MISSION_ALREADY_ENDED")
          ).extensions.missionEnd.endTime;
          if (currentActivityId) {
            this.store.updateEntityObject({
              objectId: currentActivityId,
              entity: "activities",
              update: { endTime: missionEndTime }
            });
          }
          if (userId === this.store.userId()) {
            this.store.updateEntityObject({
              objectId: missionId,
              entity: "missions",
              update: { ended: true }
            });
          }
        }
        if (isGraphQLError(error)) {
          this.displayApiErrors({
            graphQLErrors: error.graphQLErrors,
            actionDescription: `La fin de la mission ${name ? `${name} ` : ""}`,
            overrideFormatGraphQLError: gqlError => {
              const selfId = this.store.userId();
              const user =
                userId === selfId
                  ? this.store.userInfo()
                  : this.store.getEntity("coworkers")[userId.toString()];
              return this.formatLogActivityError(gqlError, user, selfId);
            },
            hasRequestFailed: true,
            shouldProposeRefresh:
              userId === this.store.userId() &&
              this.shouldProposeRefresh(error),
            isActionDescriptionFemale: true
          });
        }
      }
    });

    api.registerResponseHandler("validateMission", {
      onSuccess: async (apiResponse, { validation }) => {
        const mission = apiResponse.data.activities.validateMission.mission;
        this.store.updateEntityObject({
          objectId: mission.id,
          entity: "missions",
          update: {
            ...mission,
            ended: true,
            validation,
            adminValidation: apiResponse.data.activities.validateMission.isAdmin
              ? validation
              : null
          }
        });
        this.alerts.success(
          `La mission${
            mission.name ? " " + mission.name : ""
          } a été validée avec succès !`,
          mission.id,
          6000
        );
      }
    });

    api.registerResponseHandler("logExpenditure", {
      onSuccess: apiResponse => {
        const expenditure = apiResponse.data.activities.logExpenditure;
        this.store.createEntityObject(expenditure, "expenditures");
      },
      onError: (error, { userId, type }) => {
        if (isGraphQLError(error)) {
          const user =
            userId === this.store.userId()
              ? this.store.userInfo()
              : this.store.getEntity("coworkers")[userId.toString()];
          this.displayApiErrors({
            graphQLErrors: error.graphQLErrors,
            overrideFormatGraphQLError: gqlError => {
              if (graphQLErrorMatchesCode(gqlError, "DUPLICATE_EXPENDITURES")) {
                return "Un frais de cette nature a déjà été enregistré sur la mission.";
              }
            },
            actionDescription: `Le ${
              EXPENDITURES[type].label
            } de ${formatPersonName(user)}`,
            hasRequestFailed: true,
            shouldReload: false
          });
        }
      }
    });

    api.registerResponseHandler("cancelExpenditure", {
      onSuccess: (apiResponse, { expenditureId }) => {
        this.store.deleteEntityObject(expenditureId, "expenditures");
      }
    });

    api.registerResponseHandler("logComment", {
      onSuccess: apiResponse => {
        const comment = apiResponse.data.activities.logComment;
        this.store.createEntityObject(comment, "comments");
      }
    });

    api.registerResponseHandler("cancelComment", {
      onSuccess: (apiResponse, { commentId }) => {
        this.store.deleteEntityObject(commentId, "comments");
      }
    });

    api.registerResponseHandler("logLocation", {
      onSuccess: (
        apiResponse,
        { missionId, isStart, missionLocationTempId }
      ) => {
        const location = apiResponse.data.activities.logLocation;
        this.store.updateEntityObject({
          objectId: missionId,
          entity: "missions",
          update: { [isStart ? "startLocation" : "endLocation"]: location }
        });
        this.store.addToIdentityMap(missionLocationTempId, location.id);
      }
    });

    api.registerResponseHandler("updateMissionVehicle", {
      onSuccess: (apiResponse, { missionId }) => {
        const vehicle = apiResponse.data.activities.updateMissionVehicle;
        this.store.updateEntityObject({
          objectId: missionId,
          entity: "missions",
          update: { vehicle }
        });
      }
    });

    api.registerResponseHandler("registerKilometerReading", {
      onSuccess: (apiResponse, { missionId, isStart, kilometerReading }) => {
        const success =
          apiResponse.data.activities.registerKilometerAtLocation.success;
        if (success) {
          const locationEntryKey = isStart ? "startLocation" : "endLocation";
          this.store.updateEntityObject({
            objectId: missionId,
            entity: "missions",
            update: {
              [locationEntryKey]: {
                kilometerReading
              }
            },
            deepMerge: true
          });
        }
      }
    });

    window.addEventListener("online", () => api.executePendingRequests());
  }

  displayApiErrors = async ({
    graphQLErrors,
    actionDescription,
    overrideFormatGraphQLError = null,
    hasRequestFailed = true,
    shouldProposeRefresh = false,
    isActionDescriptionFemale = false,
    title = null,
    message = null
  }) => {
    this.modals.open("apiErrorDialog", {}, currentProps => {
      const newError = {
        actionDescription,
        graphQLErrors,
        overrideFormatGraphQLError,
        hasRequestFailed,
        shouldProposeRefresh,
        isActionDescriptionFemale,
        title,
        message
      };
      const updatedErrors = currentProps.errors
        ? [...currentProps.errors, newError]
        : [newError];

      return {
        ...currentProps,
        shouldProposeRefresh:
          shouldProposeRefresh || currentProps.shouldProposeRefresh,
        errors: updatedErrors
      };
    });
  };

  submitAction = (
    query,
    variables,
    optimisticStoreUpdate,
    watchFields,
    responseHandlerName,
    groupId = null
  ) => {
    // 1. Store the request and optimistically update the store as if the api responded successfully
    const time = Date.now();
    const request = this.store.newRequest(
      query,
      variables,
      optimisticStoreUpdate,
      watchFields,
      responseHandlerName,
      groupId
    );

    // 2. Execute the request (call API) along with any other pending one
    // await api.nonConcurrentQueryQueue.execute(() => api.executeRequest(request));
    this.api.executePendingRequests();
    return this.api.recentRequestStatuses.get(request.id, time);
  };

  graphQLErrorImpliesNotUpToDateData = gqlError => {
    if (graphQLErrorMatchesCode(gqlError, "OVERLAPPING_MISSIONS")) {
      return (
        gqlError.extensions.conflictingMission &&
        gqlError.extensions.conflictingMission.submitter.id !==
          this.store.userId() &&
        !this.store.getEntity("missions")[
          gqlError.extensions.conflictingMission.id.toString()
        ]
      );
    }
    if (graphQLErrorMatchesCode(gqlError, "MISSION_ALREADY_ENDED")) {
      return (
        gqlError.extensions.missionEnd &&
        gqlError.extensions.missionEnd.submitter.id !== this.store.userId()
      );
    }
    if (graphQLErrorMatchesCode(gqlError, "OVERLAPPING_ACTIVITIES")) {
      return (
        gqlError.extensions.conflictingActivity &&
        gqlError.extensions.conflictingActivity.submitter.id !==
          this.store.userId() &&
        !this.store.getEntity("activities")[
          gqlError.extensions.conflictingActivity.id.toString()
        ]
      );
    }
  };

  shouldProposeRefresh = error => {
    return (
      isGraphQLError(error) &&
      error.graphQLErrors.some(e => this.graphQLErrorImpliesNotUpToDateData(e))
    );
  };

  pushNewTeamActivityEvent = async ({
    activityType,
    missionId,
    startTime,
    team = [],
    endTime = null,
    comment = null,
    driverId = null,
    switchMode = true,
    forceNonBatchable = false
  }) => {
    if (team.length === 0)
      return await this.pushNewActivityEvent({
        activityType,
        missionId,
        startTime,
        endTime,
        comment,
        switchMode,
        forceNonBatchable
      });

    const teamToType = {};
    team.forEach(id => {
      if (activityType === ACTIVITIES.drive.name && driverId) {
        teamToType[id] =
          id === driverId ? ACTIVITIES.drive.name : ACTIVITIES.support.name;
      } else teamToType[id] = activityType;
    });

    const groupId = this.store.generateId("nextRequestGroupId");

    const userId = this.store.userId();
    let baseActivityResult = null;
    if (team.includes(userId)) {
      baseActivityResult = this.pushNewActivityEvent({
        activityType: teamToType[userId],
        missionId,
        startTime,
        userId: userId,
        endTime,
        comment,
        switchMode,
        forceKillSisterActivitiesOnFail: team.length > 1,
        forceNonBatchable,
        groupId
      });
    }

    if (!baseActivityResult || !baseActivityResult.error) {
      team
        .filter(id => id !== userId)
        .forEach(async id => {
          this.pushNewActivityEvent({
            activityType: teamToType[id],
            missionId,
            startTime,
            userId: id,
            endTime,
            comment,
            switchMode,
            groupId,
            immediateSubmit: false
          });
        });
    }
  };

  formatLogActivityError = (gqlError, user, selfId) => {
    if (graphQLErrorMatchesCode(gqlError, "OVERLAPPING_MISSIONS")) {
      if (!user) {
        return "L'utilisateur a déjà une autre mission en cours à ce moment là.";
      }
      return `${formatNameInGqlError(user, selfId, true)} ${
        user.id === selfId ? "êtes" : "est"
      } à ce moment là déjà dans la mission ${
        gqlError.extensions.conflictingMission.name
      } créée par ${formatNameInGqlError(
        gqlError.extensions.conflictingMission.submitter,
        selfId,
        false,
        true
      )} le ${formatDay(
        gqlError.extensions.conflictingMission.receptionTime,
        true
      )}.`;
    }
    if (graphQLErrorMatchesCode(gqlError, "MISSION_ALREADY_ENDED")) {
      if (gqlError.extensions.missionEnd) {
        return `La mission a déjà été terminée par ${formatNameInGqlError(
          gqlError.extensions.missionEnd.submitter,
          selfId,
          false,
          true
        )} à ${formatTimeOfDay(gqlError.extensions.missionEnd.endTime)}.`;
      }
    }
    if (graphQLErrorMatchesCode(gqlError, "OVERLAPPING_ACTIVITIES")) {
      return `Conflit avec ${
        gqlError.extensions.conflictingActivity
          ? `l'activité ${
              ACTIVITIES[gqlError.extensions.conflictingActivity.type].label
            } démarrée le ${formatDay(
              gqlError.extensions.conflictingActivity.startTime,
              true
            )} à ${formatTimeOfDay(
              gqlError.extensions.conflictingActivity.startTime
            )} et enregistrée par ${formatNameInGqlError(
              gqlError.extensions.conflictingActivity.submitter,
              selfId,
              false,
              true
            )}`
          : "d'autres activités de l'utilisateur"
      }.`;
    }
  };

  pushNewActivityEvent = ({
    activityType,
    missionId,
    startTime,
    userId = null,
    endTime = null,
    comment = null,
    switchMode = true,
    groupId = null,
    forceKillSisterActivitiesOnFail = false,
    forceNonBatchable = false
  }) => {
    const actualUserId = userId || this.store.userId();
    const newActivity = {
      type: activityType,
      missionId,
      startTime,
      endTime,
      userId: actualUserId
    };

    if (comment) newActivity.context = { comment };

    const updateStore = (store, requestId) => {
      if (switchMode) {
        this._findAndCloseCurrentActivity(
          actualUserId,
          missionId,
          startTime,
          requestId
        );
      }
      const newItemId = this.store.createEntityObject(
        {
          ...newActivity,
          startTime: truncateMinute(startTime),
          endTime: endTime ? truncateMinute(endTime) : null
        },
        "activities",
        requestId
      );
      return {
        activityId: newItemId,
        requestId,
        switchMode,
        endTime,
        actualUserId,
        startTime,
        forceKillSisterActivitiesOnFail,
        groupId,
        type: activityType
      };
    };

    return this.submitAction(
      LOG_ACTIVITY_MUTATION,
      { ...newActivity, switch: switchMode },
      updateStore,
      ["activities"],
      "logActivity",
      groupId
    );
  };

  editActivityEvent = async (
    activityEvent,
    actionType,
    newStartTime = null,
    newEndTime = null,
    comment = null,
    forAllTeam = false
  ) => {
    const identityMap = this.store.identityMap();
    if (forAllTeam) {
      const activitiesToEdit = values(
        this.store.getEntity("activities")
      ).filter(
        a =>
          (a.missionId === activityEvent.missionId ||
            (identityMap[activityEvent.missionId] &&
              a.missionId === identityMap[activityEvent.missionId])) &&
          a.startTime === activityEvent.startTime &&
          a.endTime === activityEvent.endTime
      );
      activitiesToEdit
        .filter(a => a.userId === this.store.userId())
        .map(a =>
          this.editActivityEvent(
            a,
            actionType,
            newStartTime,
            newEndTime,
            comment,
            false
          )
        );
      activitiesToEdit
        .filter(a => a.userId !== this.store.userId())
        .map(a =>
          this.editActivityEvent(
            a,
            actionType,
            newStartTime,
            newEndTime,
            comment,
            false
          )
        );
      return;
    }

    const payload = {
      activityId: activityEvent.id
    };

    if (comment) payload.context = { comment };

    let shouldCancel = actionType === "cancel";

    const updatedStartTime = newStartTime || activityEvent.startTime;
    const updatedEndTime = newEndTime || activityEvent.endTime;
    if (
      !payload.removeEndTime &&
      updatedEndTime &&
      sameMinute(updatedStartTime, updatedEndTime)
    ) {
      shouldCancel = true;
    }

    if (!shouldCancel) {
      payload.startTime = newStartTime;
      payload.endTime = newEndTime;
      payload.removeEndTime = !newEndTime;
    }

    const updateStore = (store, requestId) => {
      if (shouldCancel) {
        this.store.deleteEntityObject(
          activityEvent.id,
          "activities",
          requestId
        );
      } else {
        this.store.updateEntityObject({
          objectId: activityEvent.id,
          entity: "activities",
          update: {
            startTime: truncateMinute(newStartTime),
            endTime: newEndTime ? truncateMinute(newEndTime) : null
          },
          pendingRequestId: requestId
        });
      }
      return {
        activityId: activityEvent.id,
        shouldCancel,
        newEndTime,
        userId: activityEvent.userId,
        type: activityEvent.type
      };
    };

    await this.submitAction(
      shouldCancel ? CANCEL_ACTIVITY_MUTATION : EDIT_ACTIVITY_MUTATION,
      payload,
      updateStore,
      ["activities"],
      "cancelOrEditActivity"
    );
  };

  beginNewMission = async ({
    name,
    firstActivityType = null,
    companyId,
    team = null,
    vehicle = null,
    driverId = null,
    startLocation = null,
    endLocation = null,
    kilometerReading = null,
    endKilometerReading = null
  }) => {
    const missionPayload = {
      name,
      companyId,
      vehicleId: vehicle ? vehicle.id : null,
      vehicleRegistrationNumber: vehicle ? vehicle.registrationNumber : null
    };

    let missionCurrentId;

    const updateMissionStore = (store, requestId) => {
      const mission = {
        name,
        companyId,
        vehicle,
        ended: false
      };
      const missionId = this.store.createEntityObject(
        mission,
        "missions",
        requestId
      );
      missionCurrentId = missionId;
      return { missionId };
    };

    this.submitAction(
      CREATE_MISSION_MUTATION,
      missionPayload,
      updateMissionStore,
      ["missions"],
      "beginMission"
    );

    firstActivityType &&
      this.pushNewTeamActivityEvent({
        activityType: firstActivityType,
        missionId: missionCurrentId,
        startTime: now(),
        team,
        driverId,
        forceNonBatchable: true
      });
    startLocation &&
      this.logLocation({
        address: startLocation,
        missionId: missionCurrentId,
        isStart: true,
        kilometerReading
      });
    endLocation &&
      this.logLocation({
        address: endLocation,
        missionId: missionCurrentId,
        isStart: false,
        kilometerReading: endKilometerReading
      });

    return missionCurrentId;
  };

  logLocation = async ({
    address,
    missionId,
    isStart,
    kilometerReading = null
  }) => {
    const formattedAddress = address.id
      ? address
      : address.manual
      ? { manual: address.manual, name: address.name }
      : address.properties
      ? { ...address.properties, postalCode: address.properties.postcode }
      : typeof address === "string"
      ? { manual: true, name: address }
      : null;

    const payload = buildLogLocationPayloadFromAddress(
      address,
      missionId,
      isStart,
      kilometerReading || null
    );

    const updateStore = (store, requestId) => {
      const tempId = this.store.generateTempEntityObjectId();
      this.store.updateEntityObject({
        objectId: missionId,
        entity: "missions",
        update: {
          [isStart ? "startLocation" : "endLocation"]: formattedAddress
            ? { ...formattedAddress, kilometerReading, id: tempId }
            : null
        },
        pendingRequestId: requestId
      });
      return { missionId, isStart, missionLocationTempId: tempId };
    };

    await this.submitAction(
      LOG_LOCATION_MUTATION,
      payload,
      updateStore,
      ["missions"],
      "logLocation"
    );
  };

  registerKilometerReading = async ({
    mission,
    location,
    isStart,
    kilometerReading
  }) => {
    const kilometerReadingOrNull = kilometerReading || null;
    const payload = {
      missionLocationId: location.id,
      kilometerReading: kilometerReadingOrNull
    };

    const updateStore = (store, requestId) => {
      store.updateEntityObject({
        objectId: mission.id,
        entity: "missions",
        update: {
          [isStart ? "startLocation" : "endLocation"]: {
            ...location,
            kilometerReading: kilometerReadingOrNull
          }
        },
        pendingRequestId: requestId
      });
      return {
        isStart,
        kilometerReading: kilometerReadingOrNull,
        missionId: mission.id
      };
    };

    await this.submitAction(
      REGISTER_KILOMETER_AT_LOCATION,
      payload,
      updateStore,
      ["missions"],
      "registerKilometerReading"
    );
  };

  updateMissionVehicle = async ({ mission, vehicle }) => {
    const payload = {
      missionId: mission.id,
      vehicleId: vehicle.id,
      vehicleRegistrationNumber: vehicle.registrationNumber
    };

    const updateStore = (store, requestId) => {
      store.updateEntityObject({
        objectId: mission.id,
        entity: "missions",
        update: { vehicle },
        pendingRequestId: requestId
      });
      return { missionId: mission.id };
    };

    await this.submitAction(
      UPDATE_MISSION_VEHICLE_MUTATION,
      payload,
      updateStore,
      ["missions"],
      "updateMissionVehicle"
    );
  };

  endMissionForTeam = async ({
    endTime,
    expenditures,
    mission,
    team = [],
    comment = null,
    endLocation = null,
    kilometerReading = null
  }) => {
    if (team.length === 0)
      return await this.endMission({
        endTime,
        mission,
        expenditures,
        comment,
        endLocation,
        kilometerReading
      });

    const userId = this.store.userId();
    if (team.includes(userId)) {
      await this.endMission({
        endTime,
        mission,
        userId,
        expenditures,
        comment,
        endLocation,
        kilometerReading
      });
    }

    return Promise.all(
      team
        .filter(id => id !== userId)
        .map(id =>
          this.endMission({
            endTime,
            mission,
            userId: id,
            expenditures
          })
        )
    );
  };

  openEndMissionModal = async ({
    mission,
    team,
    missionEndTime,
    latestActivityEndOrStartTime
  }) => {
    this.modals.open("endMission", {
      currentExpenditures: regroupExpendituresSpendingDateByType(
        mission.expenditures
      ),
      companyAddresses: this.store
        .getEntity("knownAddresses")
        .filter(
          a =>
            a.companyId ===
            (mission.company ? mission.company.id : mission.companyId)
        ),
      missionEndTime: missionEndTime,
      handleMissionEnd: async (
        expenditures,
        comment,
        address,
        kilometerReading,
        endTime
      ) =>
        await this.endMissionForTeam({
          mission: mission,
          team: mission.submittedBySomeoneElse ? [] : team,
          endTime,
          expenditures,
          comment,
          endLocation: address,
          kilometerReading
        }),
      currentEndLocation: mission.endLocation,
      currentMission: mission,
      missionMinEndTime: latestActivityEndOrStartTime
    });
  };

  _findAndCloseCurrentActivity = (
    userId,
    missionId,
    endTime,
    pendingRequestId
  ) => {
    const identityMap = this.store.identityMap();

    const currentActivity = values(this.store.getEntity("activities")).find(
      a =>
        a.userId === userId &&
        (a.missionId === missionId ||
          (identityMap[missionId] && a.missionId === identityMap[missionId])) &&
        !a.endTime
    );

    if (currentActivity) {
      if (sameMinute(currentActivity.startTime, endTime)) {
        this.editActivityEvent(currentActivity, "cancel");
      } else
        this.store.updateEntityObject({
          objectId: currentActivity.id,
          entity: "activities",
          update: { endTime: truncateMinute(endTime) },
          pendingRequestId
        });
    }
    return currentActivity;
  };

  endMission = async ({
    endTime,
    expenditures,
    mission,
    userId = null,
    comment = null,
    endLocation = null,
    kilometerReading = null
  }) => {
    const missionId = mission.id;
    const actualUserId = userId || this.store.userId();
    const endMissionPayload = {
      endTime,
      missionId,
      userId: actualUserId
    };
    const updateStore = (store, requestId) => {
      const currentActivity = this._findAndCloseCurrentActivity(
        actualUserId,
        missionId,
        endTime,
        requestId
      );

      this.store.updateEntityObject({
        objectId: missionId,
        entity: "missions",
        update: { ended: true },
        pendingRequestId: requestId
      });
      return {
        userId: actualUserId,
        missionId,
        name: mission.name,
        currentActivityId: currentActivity ? currentActivity.id : null
      };
    };

    await Promise.all([
      this.submitAction(
        END_MISSION_MUTATION,
        endMissionPayload,
        updateStore,
        ["activities", "missions"],
        "endMission"
      ),
      this.editExpenditures(
        expenditures,
        mission.expenditures,
        missionId,
        userId
      ),
      comment ? this.logComment({ text: comment, missionId }) : null,
      endLocation
        ? this.logLocation({
            address: endLocation,
            missionId,
            isStart: false,
            kilometerReading
          })
        : null
    ]);
  };

  validateMission = async mission => {
    const userId = this.store.userId();
    const validation = {
      receptionTime: now(),
      submitterId: userId,
      userId: userId
    };
    const update = { ended: true, validation };

    const updateStore = (store, requestId) => {
      this.store.updateEntityObject({
        objectId: mission.id,
        entity: "missions",
        update,
        pendingRequestId: requestId
      });
      return { validation };
    };

    await this.submitAction(
      VALIDATE_MISSION_MUTATION,
      { missionId: mission.id, userId: this.store.userId() },
      updateStore,
      ["missions"],
      "validateMission"
    );
  };

  editExpendituresForTeam = async (
    newExpenditures,
    oldMissionExpenditures,
    missionId,
    team = []
  ) => {
    if (team.length === 0) {
      return this.editExpenditures(
        newExpenditures,
        oldMissionExpenditures,
        missionId
      );
    }
    return Promise.all(
      team.map(id =>
        this.editExpenditures(
          newExpenditures,
          oldMissionExpenditures,
          missionId,
          id
        )
      )
    );
  };

  editExpenditures = async (
    newExpenditures,
    oldMissionExpenditures,
    missionId,
    userId = null
  ) => {
    const oldUserExpenditures = oldMissionExpenditures.filter(
      e => e.userId === userId || this.store.userId()
    );
    return await editUserExpenditures(
      newExpenditures,
      oldUserExpenditures,
      missionId,
      this.logExpenditure,
      this.cancelExpenditure,
      userId
    );
  };

  logExpenditureForTeam = async ({
    type,
    missionId,
    spendingDate,
    team = []
  }) => {
    if (team.length === 0) {
      return this.logExpenditure({ type, missionId, spendingDate });
    }
    return Promise.all(
      team.map(id =>
        this.logExpenditure({ type, missionId, spendingDate, userId: id })
      )
    );
  };

  logExpenditure = async ({ type, missionId, spendingDate, userId = null }) => {
    const actualUserId = userId || this.store.userId();
    const newExpenditure = {
      type,
      missionId,
      userId: actualUserId,
      spendingDate
    };

    const updateStore = (store, requestId) => {
      this.store.createEntityObject(
        { ...newExpenditure, receptionTime: now() },
        "expenditures",
        requestId
      );
      return { missionId, userId: actualUserId, type, spendingDate };
    };

    await this.submitAction(
      LOG_EXPENDITURE_MUTATION,
      newExpenditure,
      updateStore,
      ["expenditures"],
      "logExpenditure"
    );
  };

  cancelExpenditure = async ({ expenditure }) => {
    if (isPendingSubmission(expenditure)) {
      if (
        this.api.isCurrentlySubmittingRequests() ||
        expenditure.pendingUpdates.some(upd => upd.type === "delete")
      )
        return;

      const pendingCreationRequest = this.store
        .pendingRequests()
        .find(r => r.id === expenditure.pendingUpdates[0].requestId);
      if (pendingCreationRequest)
        return await this.store.clearPendingRequest(pendingCreationRequest);
    }

    const updateStore = (store, requestId) => {
      this.store.deleteEntityObject(expenditure.id, "expenditures", requestId);
      return { expenditureId: expenditure.id };
    };

    await this.submitAction(
      CANCEL_EXPENDITURE_MUTATION,
      { expenditureId: expenditure.id },
      updateStore,
      ["expenditures"],
      "cancelExpenditure"
    );
  };

  logComment = async ({ text, missionId }) => {
    const newComment = {
      text,
      missionId,
      submitterId: this.store.userId()
    };

    const updateStore = (store, requestId) => {
      this.store.createEntityObject(
        { ...newComment, receptionTime: Date.now() },
        "comments",
        requestId
      );
      return { missionId };
    };

    await this.submitAction(
      LOG_COMMENT_MUTATION,
      newComment,
      updateStore,
      ["comments"],
      "logComment"
    );
  };

  cancelComment = async commentToCancel => {
    if (isPendingSubmission(commentToCancel)) {
      if (
        this.api.isCurrentlySubmittingRequests() ||
        commentToCancel.pendingUpdates.some(upd => upd.type === "delete")
      )
        return;

      const pendingCreationRequest = this.store
        .pendingRequests()
        .find(r => r.id === commentToCancel.pendingUpdates[0].requestId);
      if (pendingCreationRequest)
        return await this.store.clearPendingRequest(pendingCreationRequest);
    }

    const updateStore = (store, requestId) => {
      this.store.deleteEntityObject(commentToCancel.id, "comments", requestId);
      return { commentId: commentToCancel.id };
    };

    await this.submitAction(
      CANCEL_COMMENT_MUTATION,
      { commentId: commentToCancel.id },
      updateStore,
      ["comments"],
      "cancelComment"
    );
  };
}

export function ActionsContextProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  api.displayNonAvailableOfflineModeError = () =>
    modals.open("unavailableOfflineMode");

  const actions = React.useState(new Actions(store, api, modals, alerts))[0];

  return (
    <ActionsContext.Provider value={actions}>
      {children}
    </ActionsContext.Provider>
  );
}

export const useActions = () => React.useContext(ActionsContext);
