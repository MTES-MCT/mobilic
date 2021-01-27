import React from "react";
import mapValues from "lodash/mapValues";
import map from "lodash/map";
import values from "lodash/values";
import find from "lodash/find";
import { isPendingSubmission, useStoreSyncedWithLocalStorage } from "./store";
import {
  CANCEL_ACTIVITY_MUTATION,
  CANCEL_COMMENT_MUTATION,
  CANCEL_EXPENDITURE_MUTATION,
  CREATE_MISSION_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  END_MISSION_MUTATION,
  LOG_ACTIVITY_MUTATION,
  LOG_COMMENT_MUTATION,
  LOG_EXPENDITURE_MUTATION,
  useApi,
  VALIDATE_MISSION_MUTATION
} from "./api";
import { ACTIVITIES, parseActivityPayloadFromBackend } from "./activities";
import { parseMissionPayloadFromBackend } from "./mission";
import { getTime } from "./events";
import { useModals } from "./modals";
import {
  formatNameInGqlError,
  graphQLErrorMatchesCode,
  isGraphQLError
} from "./errors";
import { formatDay, formatTimeOfDay, now, truncateMinute } from "./time";
import { formatPersonName } from "./coworkers";
import { useSnackbarAlerts } from "../../web/common/Snackbar";

const ActionsContext = React.createContext(() => {});

export function ActionsContextProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  async function displayApiErrors({
    graphQLErrors,
    actionDescription,
    overrideFormatGraphQLError = null,
    hasRequestFailed = true,
    shouldReload = false,
    isActionDescriptionFemale = false,
    title = null,
    message = null
  }) {
    modals.open("apiErrorDialog", {}, currentProps => {
      const newError = {
        actionDescription,
        graphQLErrors,
        overrideFormatGraphQLError,
        hasRequestFailed,
        shouldReload,
        isActionDescriptionFemale,
        title,
        message
      };
      const updatedErrors = currentProps.errors
        ? [...currentProps.errors, newError]
        : [newError];

      return { ...currentProps, errors: updatedErrors };
    });
  }

  async function submitAction(
    query,
    variables,
    optimisticStoreUpdate,
    watchFields,
    responseHandlerName,
    batchable = true
  ) {
    // 1. Store the request and optimistically update the store as if the api responded successfully
    const request = await store.newRequest(
      query,
      variables,
      optimisticStoreUpdate,
      watchFields,
      responseHandlerName,
      batchable
    );

    // 2. Execute the request (call API) along with any other pending one
    // await api.nonConcurrentQueryQueue.execute(() => api.executeRequest(request));
    const executionResults = await api.executePendingRequests();
    return executionResults[request.id.toString()];
  }

  const pushNewTeamActivityEvent = async ({
    activityType,
    missionActivities,
    missionId,
    startTime,
    team = [],
    endTime = null,
    comment = null,
    driverId = null,
    switchMode = true
  }) => {
    if (team.length === 0)
      return await pushNewActivityEvent({
        activityType,
        missionActivities,
        missionId,
        startTime,
        endTime,
        comment,
        switchMode
      });

    const teamToType = {};
    team.forEach(id => {
      if (activityType === ACTIVITIES.drive.name && driverId) {
        teamToType[id] =
          id === driverId ? ACTIVITIES.drive.name : ACTIVITIES.support.name;
      } else teamToType[id] = activityType;
    });

    const userId = store.userId();
    let baseActivityResult = null;
    if (team.includes(userId)) {
      baseActivityResult = await pushNewActivityEvent({
        activityType: teamToType[userId],
        missionActivities,
        missionId,
        startTime,
        userId: userId,
        endTime,
        comment,
        switchMode,
        forceKillSisterActivitiesOnFail: team.length > 1
      });
    }

    if (!baseActivityResult || !baseActivityResult.error) {
      await Promise.all(
        team
          .filter(id => id !== userId)
          .map(id =>
            pushNewActivityEvent({
              activityType: teamToType[id],
              missionActivities,
              missionId,
              startTime,
              userId: id,
              endTime,
              comment,
              switchMode
            })
          )
      );
    }
  };

  function formatLogActivityError(gqlError, user, selfId) {
    if (graphQLErrorMatchesCode(gqlError, "OVERLAPPING_MISSIONS")) {
      if (!user) {
        return "L'utilisateur a déjà une mission en cours";
      }
      return `${formatNameInGqlError(user, selfId, true)} ${
        user.id === selfId ? "avez" : "a"
      } déjà une mission en cours démarrée par ${formatNameInGqlError(
        gqlError.extensions.conflictingMission.submitter,
        selfId,
        false
      )} le ${formatDay(
        getTime(gqlError.extensions.conflictingMission)
      )} à ${formatTimeOfDay(getTime(gqlError.extensions.conflictingMission))}`;
    }
    if (graphQLErrorMatchesCode(gqlError, "MISSION_ALREADY_ENDED")) {
      if (gqlError.extensions.missionEnd) {
        return `La mission a déjà été terminée par ${formatNameInGqlError(
          gqlError.extensions.missionEnd.submitter,
          selfId,
          false
        )} à ${formatTimeOfDay(gqlError.extensions.missionEnd.endTime)}`;
      }
    }
    if (graphQLErrorMatchesCode(gqlError, "OVERLAPPING_ACTIVITIES")) {
      return "L'utilisateur a déjà une activité en cours à ce moment là";
    }
  }

  const pushNewActivityEvent = async ({
    activityType,
    missionActivities,
    missionId,
    startTime,
    userId = null,
    endTime = null,
    comment = null,
    switchMode = true,
    forceKillSisterActivitiesOnFail = false
  }) => {
    const actualUserId = userId || store.userId();
    const newActivity = {
      type: activityType,
      missionId,
      startTime,
      endTime,
      userId: actualUserId
    };

    if (comment) newActivity.context = { comment };

    const updateStore = async (store, requestId) => {
      if (switchMode) {
        const currentActivity = missionActivities.find(
          a => a.userId === actualUserId && !a.endTime
        );
        if (currentActivity) {
          store.updateEntityObject(
            currentActivity.id,
            "activities",
            { endTime: truncateMinute(startTime) },
            requestId
          );
        }
      }
      const newItemId = await store.createEntityObject(
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
        type: activityType
      };
    };

    await submitAction(
      LOG_ACTIVITY_MUTATION,
      { ...newActivity, switch: switchMode },
      updateStore,
      ["activities"],
      "logActivity",
      !forceKillSisterActivitiesOnFail
    );
  };

  api.registerResponseHandler("logActivity", {
    onSuccess: (
      apiResponse,
      { activityId: tempActivityId, requestId, switchMode, endTime }
    ) => {
      const activity = parseActivityPayloadFromBackend(
        apiResponse.data.activities.logActivity
      );
      const activities = [activity];
      let syncScope = a => false;
      if (switchMode) {
        const previousActivity = values(store.getEntity("activities")).find(
          a =>
            a.userId === activity.userId &&
            a.id !== tempActivityId &&
            isPendingSubmission(a) &&
            a.pendingUpdates.some(
              upd => upd.type === "update" && upd.requestId === requestId
            )
        );
        if (previousActivity && previousActivity.id !== activity.id) {
          activities.push({ ...previousActivity, endTime: activity.startTime });
          syncScope = a => a.id === previousActivity.id;
        }
      }
      store.addToIdentityMap(tempActivityId, activity.id);
      if (!endTime) {
        store.syncEntity(
          [
            {
              ...store.getEntity("missions")[activity.missionId.toString()],
              ended: false
            }
          ],
          "missions",
          m => m.id === activity.missionId
        );
      }
      store.syncEntity(activities, "activities", syncScope, {
        [activity.id]: tempActivityId
      });
    },
    onError: async (
      error,
      {
        actualUserId,
        requestId,
        activityId: tempActivityId,
        type,
        forceKillSisterActivitiesOnFail,
        startTime
      }
    ) => {
      // If the log-activity event raises an API error we cancel all the pending requests for the activity
      let requestsToCancel = store
        .pendingRequests()
        .filter(
          req =>
            (req.variables && req.variables.activityId === tempActivityId) ||
            (req.storeInfo && req.storeInfo.activityId === tempActivityId)
        );
      // If the activity should not be submitted for team mates because it failed for the main user, cancel the corresponding requests
      if (forceKillSisterActivitiesOnFail) {
        let otherRequestsToCancel = store
          .pendingRequests()
          .filter(
            req =>
              req.apiResponseHandlerName &&
              req.apiResponseHandlerName === "logActivity" &&
              req.variables &&
              req.variables.startTime === startTime &&
              req.variables.type === type &&
              req.variables.userId !== actualUserId &&
              req.id !== requestId
          );
        // We should also cancel further requests concerning these non submitted activities
        const activityIds = otherRequestsToCancel.map(
          req => req.storeInfo.activityId
        );
        otherRequestsToCancel = [
          ...otherRequestsToCancel,
          ...store
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
          actualUserId === store.userId()
            ? store.userInfo()
            : store.getEntity("coworkers")[actualUserId.toString()];
        displayApiErrors({
          graphQLErrors: error.graphQLErrors,
          actionDescription: `L'activité ${
            ACTIVITIES[type].label
          } pour l'utilisateur ${formatPersonName(user)}`,
          isActionDescriptionFemale: true,
          overrideFormatGraphQLError: gqlError => {
            return formatLogActivityError(gqlError, user, store.userId());
          },
          hasRequestFailed: true,
          shouldReload: false
        });
      }
      await Promise.all(
        requestsToCancel.map(req => store.clearPendingRequest(req))
      );
    }
  });

  const editActivityEvent = async (
    activityEvent,
    actionType,
    missionActivities,
    newStartTime = null,
    newEndTime = null,
    comment = null,
    forAllTeam = false
  ) => {
    if (forAllTeam) {
      const activitiesToEdit = missionActivities.filter(
        a =>
          getTime(a) === getTime(activityEvent) &&
          a.endTime === activityEvent.endTime
      );
      await Promise.all(
        activitiesToEdit
          .filter(a => a.userId === store.userId())
          .map(a =>
            editActivityEvent(
              a,
              actionType,
              missionActivities,
              newStartTime,
              newEndTime,
              comment,
              false
            )
          )
      );
      await Promise.all(
        activitiesToEdit
          .filter(a => a.userId !== store.userId())
          .map(a =>
            editActivityEvent(
              a,
              actionType,
              missionActivities,
              newStartTime,
              newEndTime,
              comment,
              false
            )
          )
      );
      return;
    }

    const payload = {
      activityId: activityEvent.id
    };

    if (comment) payload.context = { comment };

    if (actionType !== "cancel") {
      payload.startTime = newStartTime;
      payload.endTime = newEndTime;
      payload.removeEndTime = !newEndTime;
    }

    const updateStore = (store, requestId) => {
      if (actionType === "cancel") {
        store.deleteEntityObject(activityEvent.id, "activities", requestId);
      } else {
        store.updateEntityObject(
          activityEvent.id,
          "activities",
          {
            startTime: truncateMinute(newStartTime),
            endTime: newEndTime ? truncateMinute(newEndTime) : null
          },
          requestId
        );
      }
      return {
        activityId: activityEvent.id,
        actionType,
        newEndTime,
        userId: activityEvent.userId,
        type: activityEvent.type
      };
    };

    await submitAction(
      actionType === "cancel"
        ? CANCEL_ACTIVITY_MUTATION
        : EDIT_ACTIVITY_MUTATION,
      payload,
      updateStore,
      ["activities"],
      "cancelOrEditActivity",
      !activityEvent.id.toString().startsWith("temp")
    );
  };

  api.registerResponseHandler("cancelOrEditActivity", {
    onSuccess: (apiResponse, { activityId, actionType, newEndTime }) => {
      if (actionType === "cancel") {
        if (apiResponse.data.activities.cancelActivity.success) {
          store.syncEntity([], "activities", a => a.id === activityId);
        }
      } else {
        const activity = parseActivityPayloadFromBackend(
          apiResponse.data.activities.editActivity
        );
        if (!newEndTime) {
          store.syncEntity(
            [
              {
                ...store.getEntity("missions")[activity.missionId.toString()],
                ended: false
              }
            ],
            "missions",
            m => m.id === activity.missionId
          );
        }
        store.syncEntity([activity], "activities", a => a.id === activity.id);
      }
    },
    onError: (error, { userId, type }) => {
      const selfId = store.userId();
      const user =
        userId === selfId
          ? store.userInfo()
          : store.getEntity("coworkers")[userId.toString()];
      if (isGraphQLError(error)) {
        displayApiErrors({
          graphQLErrors: error.graphQLErrors,
          actionDescription: `La correction de l'activité ${
            ACTIVITIES[type].label
          } pour l'utilisateur ${formatPersonName(user)}`,
          overrideFormatGraphQLError: gqlError => {
            return formatLogActivityError(gqlError, user, selfId);
          },
          hasRequestFailed: true,
          shouldReload: false,
          isActionDescriptionFemale: true
        });
      }
    }
  });

  const beginNewMission = async ({
    name,
    firstActivityType,
    team = null,
    vehicleRegistrationNumber = null,
    vehicleId = null,
    driverId = null
  }) => {
    const missionPayload = {
      name
    };

    if (vehicleId) missionPayload.context = { vehicleId };
    else if (vehicleRegistrationNumber)
      missionPayload.context = { vehicleRegistrationNumber };

    let updateMissionStore;

    const missionIdPromise = new Promise((resolve, reject) => {
      const _updateMissionStore = async (store, requestId) => {
        const mission = {
          name,
          context: missionPayload.context || {},
          ended: false
        };
        const missionId = await store.createEntityObject(
          mission,
          "missions",
          requestId
        );
        resolve(missionId);
        return { missionId };
      };
      updateMissionStore = _updateMissionStore;
    });

    const createMission = submitAction(
      CREATE_MISSION_MUTATION,
      missionPayload,
      updateMissionStore,
      ["missions"],
      "beginMission",
      false
    );

    const missionCurrentId = await missionIdPromise;

    return await Promise.all([
      createMission,
      pushNewTeamActivityEvent({
        activityType: firstActivityType,
        missionActivities: [],
        missionId: missionCurrentId,
        startTime: now(),
        team,
        driverId
      })
    ]);
  };

  api.registerResponseHandler("beginMission", {
    onSuccess: (apiResponse, { missionId: tempMissionId }) => {
      const mission = apiResponse.data.activities.createMission;
      store.addToIdentityMap(tempMissionId, mission.id);
      store.syncEntity(
        [
          parseMissionPayloadFromBackend(
            { ...mission, ended: false },
            store.userId()
          )
        ],
        "missions",
        () => false,
        { [mission.id]: tempMissionId }
      );
      store.setStoreState(
        prevState => ({
          activities: mapValues(prevState.activities, a => ({
            ...a,
            missionId: a.missionId === tempMissionId ? mission.id : a.missionId
          }))
        }),
        ["activities"]
      );
      store.setStoreState(
        prevState => ({
          expenditures: mapValues(prevState.expenditures, e => ({
            ...e,
            missionId: e.missionId === tempMissionId ? mission.id : e.missionId
          }))
        }),
        ["expenditures"]
      );
    },
    onError: async (error, { missionId: tempMissionId }) => {
      // If the begin-mission event raises an API error we cancel all the pending requests for the mission
      const pendingMissionRequests = store
        .pendingRequests()
        .filter(
          req =>
            (req.variables && req.variables.missionId === tempMissionId) ||
            (req.storeInfo && req.storeInfo.missionId === tempMissionId)
        );
      await Promise.all(
        pendingMissionRequests.map(req => store.clearPendingRequest(req))
      );
      store.syncEntity([], "missions", m => m.id === tempMissionId);
    }
  });

  const endMissionForTeam = async ({
    endTime,
    expenditures,
    mission,
    team = [],
    comment = null
  }) => {
    if (team.length === 0)
      return await endMission({
        endTime,
        mission,
        expenditures,
        comment
      });

    const userId = store.userId();
    if (team.includes(userId)) {
      await endMission({
        endTime,
        mission,
        userId,
        expenditures,
        comment
      });
    }

    return await Promise.all(
      team
        .filter(id => id !== userId)
        .map(id =>
          endMission({
            endTime,
            mission,
            userId: id,
            expenditures
          })
        )
    );
  };

  const endMission = async ({
    endTime,
    expenditures,
    mission,
    userId = null,
    comment = null
  }) => {
    const missionId = mission.id;
    const actualUserId = userId || store.userId();
    const endMissionPayload = {
      endTime,
      missionId,
      userId: actualUserId
    };
    const updateStore = (store, requestId) => {
      const currentActivity = values(store.getEntity("activities")).find(
        a => a.userId === actualUserId && !a.endTime
      );
      if (currentActivity) {
        store.updateEntityObject(
          currentActivity.id,
          "activities",
          { endTime: truncateMinute(endTime) },
          requestId
        );
      }
      store.updateEntityObject(
        missionId,
        "missions",
        { ended: true },
        requestId
      );
      return {
        userId: actualUserId,
        missionId,
        currentActivityId: currentActivity ? currentActivity.id : null
      };
    };

    await Promise.all([
      submitAction(
        END_MISSION_MUTATION,
        endMissionPayload,
        updateStore,
        ["activities", "missions"],
        "endMission",
        true
      ),
      editExpenditures(expenditures, mission.expenditures, missionId, userId),
      comment ? logComment({ text: comment, missionId }) : Promise.resolve(null)
    ]);
  };

  api.registerResponseHandler("endMission", {
    onSuccess: apiResponse => {
      const mission = apiResponse.data.activities.endMission;
      store.syncEntity(
        [{ ...parseMissionPayloadFromBackend(mission), ended: true }],
        "missions",
        m => m.id === mission.id
      );
      store.syncEntity(
        mission.activities.map(parseActivityPayloadFromBackend),
        "activities",
        a => a.missionId === mission.id
      );
    },
    onError: (error, { userId, missionId, currentActivityId }) => {
      if (
        isGraphQLError(error) &&
        error.graphQLErrors.some(gqle =>
          graphQLErrorMatchesCode(gqle, "MISSION_ALREADY_ENDED")
        )
      ) {
        const missionEndTime = error.graphQLErrors.find(gqle =>
          graphQLErrorMatchesCode(gqle, "MISSION_ALREADY_ENDED")
        ).extensions.missionEnd.endTime;
        if (currentActivityId)
          store.syncEntity(
            [
              {
                ...store.getEntity("activities")[currentActivityId.toString()],
                endTime: missionEndTime
              }
            ],
            "activities",
            a => a.id === currentActivityId
          );
        if (userId === store.userId()) {
          store.syncEntity(
            [
              {
                ...store.getEntity("missions")[missionId.toString()],
                ended: true
              }
            ],
            "missions",
            m => m.id === missionId
          );
        }
      }
      if (isGraphQLError(error)) {
        displayApiErrors({
          graphQLErrors: error.graphQLErrors,
          actionDescription: "La fin de mission",
          overrideFormatGraphQLError: gqlError => {
            const selfId = store.userId();
            const user =
              userId === selfId
                ? store.userInfo()
                : store.getEntity("coworkers")[userId.toString()];
            return formatLogActivityError(gqlError, user, selfId);
          },
          hasRequestFailed: true,
          shouldReload: false,
          isActionDescriptionFemale: true
        });
      }
    }
  });

  const validateMission = async mission => {
    const userId = store.userId();
    const validation = {
      receptionTime: now(),
      submitterId: userId,
      userId: userId
    };
    const update = { ended: true, validation };

    const updateStore = (store, requestId) => {
      store.updateEntityObject(mission.id, "missions", update, requestId);
      return { validation };
    };

    await submitAction(
      VALIDATE_MISSION_MUTATION,
      { missionId: mission.id, userId: store.userId() },
      updateStore,
      ["missions"],
      "validateMission"
    );
  };

  api.registerResponseHandler("validateMission", {
    onSuccess: async (apiResponse, { validation }) => {
      const mission = apiResponse.data.activities.validateMission.mission;
      await store.syncEntity(
        [{ ...mission, ended: true, validation }],
        "missions",
        m => m.id === mission.id
      );
      alerts.success(
        `La mission${
          mission.name ? " " + mission.name : ""
        } a été validée avec succès !`,
        mission.id,
        6000
      );
    }
  });

  const editExpendituresForTeam = async (
    newExpenditures,
    oldMissionExpenditures,
    missionId,
    team = []
  ) => {
    if (team.length === 0) {
      return editExpenditures(
        newExpenditures,
        oldMissionExpenditures,
        missionId
      );
    }
    return Promise.all(
      team.map(id =>
        editExpenditures(newExpenditures, oldMissionExpenditures, missionId, id)
      )
    );
  };

  const editExpenditures = async (
    newExpenditures,
    oldMissionExpenditures,
    missionId,
    userId = null
  ) => {
    const oldUserExpenditures = oldMissionExpenditures.filter(
      e => e.userId === userId || store.userId()
    );
    return await Promise.all([
      ...map(newExpenditures, (checked, type) => {
        if (checked && !oldUserExpenditures.find(e => e.type === type)) {
          return logExpenditure({ type, missionId, userId });
        }
        return Promise.resolve();
      }),
      ...oldUserExpenditures.map(e => {
        if (
          !find(newExpenditures, (checked, type) => checked && type === e.type)
        ) {
          return cancelExpenditure(e);
        }
        return Promise.resolve();
      })
    ]);
  };

  const logExpenditureForTeam = async ({ type, missionId, team = [] }) => {
    if (team.length === 0) {
      return logExpenditure({ type, missionId });
    }
    return Promise.all(
      team.map(id => logExpenditure({ type, missionId, userId: id }))
    );
  };

  const logExpenditure = async ({ type, missionId, userId = null }) => {
    const newExpenditure = {
      type,
      missionId,
      userId: userId || store.userId()
    };

    const updateStore = (store, requestId) => {
      store.createEntityObject(newExpenditure, "expenditures", requestId);
      return { missionId };
    };

    await submitAction(
      LOG_EXPENDITURE_MUTATION,
      newExpenditure,
      updateStore,
      ["expenditures"],
      "logExpenditure",
      true
    );
  };

  api.registerResponseHandler("logExpenditure", {
    onSuccess: apiResponse => {
      const expenditure = apiResponse.data.activities.logExpenditure;
      store.syncEntity([expenditure], "expenditures", () => false);
    },
    onError: error => {
      if (isGraphQLError(error)) {
        displayApiErrors({
          graphQLErrors: error.graphQLErrors,
          overrideFormatGraphQLError: gqlError => {
            if (graphQLErrorMatchesCode(gqlError, "DUPLICATE_EXPENDITURES")) {
              return "Un frais de cette nature a déjà été enregistré sur la mission.";
            }
          },
          actionDescription: "Le frais",
          hasRequestFailed: true,
          shouldReload: false
        });
      }
    }
  });

  const cancelExpenditure = async expenditureToCancel => {
    if (isPendingSubmission(expenditureToCancel)) {
      if (
        api.isCurrentlySubmittingRequests() ||
        expenditureToCancel.pendingUpdates.some(upd => upd.type === "delete")
      )
        return;

      const pendingCreationRequest = store
        .pendingRequests()
        .find(r => r.id === expenditureToCancel.pendingUpdates[0].requestId);
      if (pendingCreationRequest)
        return await store.clearPendingRequest(pendingCreationRequest);
    }

    const updateStore = (store, requestId) => {
      store.deleteEntityObject(
        expenditureToCancel.id,
        "expenditures",
        requestId
      );
      return { expenditureId: expenditureToCancel.id };
    };

    await submitAction(
      CANCEL_EXPENDITURE_MUTATION,
      { expenditureId: expenditureToCancel.id },
      updateStore,
      ["expenditures"],
      "cancelExpenditure",
      true
    );
  };

  api.registerResponseHandler("cancelExpenditure", {
    onSuccess: (apiResponse, { expenditureId }) => {
      store.syncEntity([], "expenditures", e => e.id === expenditureId);
    }
  });

  const logComment = async ({ text, missionId }) => {
    const newComment = {
      text,
      missionId,
      submitterId: store.userId()
    };

    const updateStore = (store, requestId) => {
      store.createEntityObject(
        { ...newComment, receptionTime: Date.now() },
        "comments",
        requestId
      );
      return { missionId };
    };

    await submitAction(
      LOG_COMMENT_MUTATION,
      newComment,
      updateStore,
      ["comments"],
      "logComment",
      true
    );
  };

  api.registerResponseHandler("logComment", {
    onSuccess: apiResponse => {
      const comment = apiResponse.data.activities.logComment;
      store.syncEntity([comment], "comments", () => false);
    }
  });

  const cancelComment = async commentToCancel => {
    if (isPendingSubmission(commentToCancel)) {
      if (
        api.isCurrentlySubmittingRequests() ||
        commentToCancel.pendingUpdates.some(upd => upd.type === "delete")
      )
        return;

      const pendingCreationRequest = store
        .pendingRequests()
        .find(r => r.id === commentToCancel.pendingUpdates[0].requestId);
      if (pendingCreationRequest)
        return await store.clearPendingRequest(pendingCreationRequest);
    }

    const updateStore = (store, requestId) => {
      store.deleteEntityObject(commentToCancel.id, "comments", requestId);
      return { commentId: commentToCancel.id };
    };

    await submitAction(
      CANCEL_COMMENT_MUTATION,
      { commentId: commentToCancel.id },
      updateStore,
      ["comments"],
      "cancelComment",
      true
    );
  };

  api.registerResponseHandler("cancelComment", {
    onSuccess: (apiResponse, { commentId }) => {
      store.syncEntity([], "comments", e => e.id === commentId);
    }
  });

  return (
    <ActionsContext.Provider
      value={{
        pushNewActivityEvent,
        editActivityEvent,
        beginNewMission,
        pushNewTeamActivityEvent,
        endMission,
        endMissionForTeam,
        validateMission,
        logExpenditureForTeam,
        editExpendituresForTeam,
        cancelExpenditure,
        editExpenditures,
        logComment,
        cancelComment
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export const useActions = () => React.useContext(ActionsContext);
