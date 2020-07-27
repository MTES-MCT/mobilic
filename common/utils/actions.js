import React from "react";
import mapValues from "lodash/mapValues";
import map from "lodash/map";
import find from "lodash/find";
import { isPendingSubmission, useStoreSyncedWithLocalStorage } from "./store";
import {
  CANCEL_ACTIVITY_MUTATION,
  CANCEL_EXPENDITURE_MUTATION,
  CREATE_MISSION_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  END_MISSION_MUTATION,
  LOG_ACTIVITY_MUTATION,
  LOG_EXPENDITURE_MUTATION,
  useApi,
  VALIDATE_MISSION_MUTATION
} from "./api";
import { ACTIVITIES, parseActivityPayloadFromBackend } from "./activities";
import { parseMissionPayloadFromBackend } from "./mission";
import { getTime, sortEvents } from "./events";
import { useModals } from "./modals";
import { isGraphQLError } from "./errors";

const ActionsContext = React.createContext(() => {});

export function ActionsContextProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const modals = useModals();

  async function displayApiErrors({
    apiErrors,
    actionDescription,
    hasRequestFailed = true,
    shouldReload = false,
    isActionDescriptionFemale = false,
    title = null,
    message = null
  }) {
    console.log("Test");
    modals.open("apiErrorDialog", {}, currentProps => {
      console.log(currentProps);
      const newError = {
        actionDescription,
        apiErrors,
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
    handleSubmitResponse,
    batchable = true,
    onApiError = () => {}
  ) {
    // 1. Store the request and optimistically update the store as if the api responded successfully
    await store.newRequest(
      query,
      variables,
      optimisticStoreUpdate,
      watchFields,
      handleSubmitResponse,
      batchable,
      onApiError
    );

    // 2. Execute the request (call API) along with any other pending one
    // await api.nonConcurrentQueryQueue.execute(() => api.executeRequest(request));
    await api.executePendingRequests();
  }

  const pushNewTeamActivityEvent = async ({
    activityType,
    missionActivities,
    missionId,
    startTime,
    team = [],
    endTime = null,
    comment = null,
    driverId = null
  }) => {
    if (team.length === 0)
      return await pushNewActivityEvent({
        activityType,
        missionActivities,
        missionId,
        startTime,
        endTime,
        comment
      });

    const teamToType = {};
    team.forEach(id => {
      if (activityType === ACTIVITIES.drive.name && driverId) {
        teamToType[id] =
          id === driverId ? ACTIVITIES.drive.name : ACTIVITIES.support.name;
      } else teamToType[id] = activityType;
    });

    const userId = store.userId();
    let orderedTeam = team;
    if (team.includes(userId)) {
      orderedTeam = [userId, ...team.filter(uid => uid !== userId)];
    }

    await Promise.all(
      orderedTeam.map(id =>
        pushNewActivityEvent({
          activityType: teamToType[id],
          missionActivities,
          missionId,
          startTime,
          userId: id,
          endTime,
          comment
        })
      )
    );
  };

  const pushNewActivityEvent = async ({
    activityType,
    missionActivities,
    missionId,
    startTime,
    userId = null,
    endTime = null,
    comment = null
  }) => {
    const newActivity = {
      type: activityType,
      missionId,
      startTime,
      endTime,
      userId: userId || store.userId()
    };

    if (comment) newActivity.context = { comment };

    const updateStore = (store, requestId) => {
      if (endTime)
        _handleActivitiesOverlap(
          missionActivities,
          userId || store.userId(),
          startTime,
          endTime,
          requestId
        );
      store.createEntityObject(newActivity, "activities", requestId);
    };

    await submitAction(
      LOG_ACTIVITY_MUTATION,
      newActivity,
      updateStore,
      ["activities"],
      apiResponse => {
        const activities = apiResponse.data.activities.logActivity.map(
          parseActivityPayloadFromBackend
        );
        store.syncEntity(
          activities,
          "activities",
          a =>
            a.missionId ===
            (activities.length > 0 ? activities[0].missionId : missionId)
        );
      },
      true,
      error => {
        if (isGraphQLError(error)) {
          displayApiErrors({
            apiErrors: error.graphQLErrors,
            actionDescription: "Le changement d'activité",
            hasRequestFailed: true,
            shouldReload: false
          });
        }
      }
    );
  };

  const _handleActivitiesOverlap = (
    otherActivities,
    userId,
    startTime,
    endTime,
    requestId
  ) => {
    const sortedOtherActivities = sortEvents([
      ...otherActivities.filter(a => a.userId === userId)
    ]);
    const activitiesToOverride = sortedOtherActivities.filter(
      a => startTime <= getTime(a) && getTime(a) <= endTime
    );
    if (activitiesToOverride.length > 0) {
      const activityToShift =
        activitiesToOverride[activitiesToOverride.length - 1];
      activitiesToOverride.forEach((activity, index) => {
        if (index < activitiesToOverride.length - 1) {
          store.deleteEntityObject(activity, "activities", requestId);
        }
      });
      if (endTime !== getTime(activityToShift)) {
        store.updateEntityObject(
          activityToShift.id,
          "activities",
          { startTime: endTime },
          requestId
        );
      }
    } else {
      const activitiesBefore = sortedOtherActivities.filter(
        a => getTime(a) < startTime
      );
      if (activitiesBefore.length > 0) {
        const activityImmediatelyBefore =
          activitiesBefore[activitiesBefore.length - 1];
        store.createEntityObject(
          {
            startTime: endTime,
            type: activityImmediatelyBefore.type,
            missionId: activityImmediatelyBefore.missionId,
            userId: userId
          },
          "activities",
          requestId
        );
      } else {
        const activitiesAfter = sortedOtherActivities.filter(
          a => endTime < getTime(a)
        );
        if (activitiesAfter.length > 0) {
          store.updateEntityObject(
            activitiesAfter[0],
            "activities",
            { startTime: endTime },
            requestId
          );
        }
      }
    }
  };

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
        a => getTime(a) === getTime(activityEvent)
      );
      return Promise.all(
        activitiesToEdit.map(a =>
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
    }

    if (isPendingSubmission(activityEvent)) {
      displayApiErrors({
        title: "❌ Action impossible pour le moment",
        hasRequestFailed: true,
        message:
          "La modification ne peut pas être appliquée pour le moment car vos derniers enregistrements n'ont pas été communiqués au serveur."
      });
      return;
    }

    const payload = {
      activityId: activityEvent.id
    };

    if (comment) payload.context = { comment };

    if (actionType !== "cancel") {
      payload.startTime = newStartTime;
      payload.endTime = newEndTime;
    }

    const updateStore = (store, requestId) => {
      if (actionType === "cancel") {
        store.deleteEntityObject(activityEvent.id, "activities", requestId);
      } else {
        if (newEndTime)
          _handleActivitiesOverlap(
            missionActivities.filter(a => a.id !== activityEvent.id),
            activityEvent.userId || store.userId(),
            newStartTime,
            newEndTime,
            requestId
          );
        store.updateEntityObject(
          activityEvent.id,
          "activities",
          { startTime: newStartTime },
          requestId
        );
      }
    };

    await submitAction(
      actionType === "cancel"
        ? CANCEL_ACTIVITY_MUTATION
        : EDIT_ACTIVITY_MUTATION,
      payload,
      updateStore,
      ["activities"],
      apiResponse => {
        const activities = apiResponse.data.activities[
          actionType === "cancel" ? "cancelActivity" : "editActivity"
        ].map(parseActivityPayloadFromBackend);
        store.syncEntity(
          activities,
          "activities",
          a =>
            a.missionId ===
            (activities.length > 0
              ? activities[0].missionId
              : activityEvent.missionId)
        );
      },
      true,
      error => {
        if (isGraphQLError(error)) {
          displayApiErrors({
            apiErrors: error.graphQLErrors,
            actionDescription: "La correction d'activité",
            hasRequestFailed: true,
            shouldReload: false,
            isActionDescriptionFemale: true
          });
        }
      }
    );
  };

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
          name
        };
        const missionId = await store.createEntityObject(
          mission,
          "missions",
          requestId
        );
        console.log("Store updated");
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
      async (apiResponse, { missionId: tempMissionId }) => {
        const mission = apiResponse.data.activities.createMission;
        await new Promise((resolve, reject) => {
          store.setStoreState(
            prevState => ({
              pendingRequests: prevState.pendingRequests.map(request => {
                const requestVariables = { ...request.variables };
                if (requestVariables.missionId === tempMissionId) {
                  requestVariables.missionId = mission.id;
                }
                return { ...request, variables: requestVariables };
              })
            }),
            ["pendingRequests"],
            resolve
          );
        });
        store.syncEntity(
          [parseMissionPayloadFromBackend(mission)],
          "missions",
          () => false
        );
        store.setStoreState(
          prevState => ({
            activities: mapValues(prevState.activities, a => ({
              ...a,
              missionId:
                a.missionId === tempMissionId ? mission.id : a.missionId
            }))
          }),
          ["activities"]
        );
        store.setStoreState(
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
      false,
      async (error, { missionId: tempMissionId }) => {
        // If the begin-mission event raises an API error we cancel all the pending requests for the mission
        const pendingMissionRequests = store
          .pendingRequests()
          .filter(req => req.variables.missionId === tempMissionId);
        await Promise.all(
          pendingMissionRequests.map(req => store.clearPendingRequest(req))
        );
        store.syncEntity([], "missions", m => m.id === tempMissionId);
      }
    );

    const missionCurrentId = await missionIdPromise;
    console.log("Retrieved mission Id");

    return await Promise.all([
      createMission,
      pushNewTeamActivityEvent({
        activityType: firstActivityType,
        missionActivities: [],
        missionId: missionCurrentId,
        startTime: Date.now(),
        team,
        driverId
      })
    ]);
  };

  const endMissionForTeam = async ({
    endTime,
    expenditures,
    missionId,
    team = [],
    comment = null
  }) => {
    if (team.length === 0)
      return await endMission({
        endTime,
        missionId,
        expenditures,
        comment
      });

    const userId = store.userId();
    let orderedTeam = team;
    if (team.includes(userId)) {
      orderedTeam = [userId, ...team.filter(uid => uid !== userId)];
    }

    return await Promise.all(
      orderedTeam.map(id =>
        endMission({
          endTime,
          missionId,
          userId: id,
          expenditures,
          comment
        })
      )
    );
  };

  const endMission = async ({
    endTime,
    expenditures,
    missionId,
    userId = null,
    comment = null
  }) => {
    const endMissionPayload = {
      endTime,
      missionId,
      userId: userId || store.userId()
    };
    if (comment) endMissionPayload.context = { comment };

    const updateStore = (store, requestId) => {
      store.createEntityObject(
        {
          type: ACTIVITIES.rest.name,
          startTime: endMissionPayload.endTime,
          missionId,
          userId
        },
        "activities",
        requestId
      );
    };

    await Promise.all([
      submitAction(
        END_MISSION_MUTATION,
        endMissionPayload,
        updateStore,
        ["activities"],
        apiResponse => {
          const mission = apiResponse.data.activities.endMission;
          store.syncEntity(
            mission.activities.map(parseActivityPayloadFromBackend),
            "activities",
            a => a.missionId === mission.id
          );
        },
        true,
        error => {
          if (isGraphQLError(error)) {
            displayApiErrors({
              apiErrors: error.graphQLErrors,
              actionDescription: "La fin de mission",
              hasRequestFailed: true,
              shouldReload: false,
              isActionDescriptionFemale: true
            });
          }
        }
      ),
      ...map(expenditures, (checked, type) => {
        if (checked > 0) return logExpenditure({ type, missionId, userId });
      })
    ]);
  };

  const validateMission = async mission => {
    let update = { validated: true };
    if (isPendingSubmission(mission)) {
      if (api.isCurrentlySubmittingRequests()) return;
      if (mission.pendingUpdate.type === "update") {
        update = { ...mission.pendingUpdate.new, ...update };
      }
    }
    const updateStore = (store, requestId) => {
      store.updateEntityObject(mission.id, "missions", update, requestId);
    };

    await submitAction(
      VALIDATE_MISSION_MUTATION,
      { missionId: mission.id },
      updateStore,
      ["missions"],
      async apiResponse => {
        const mission = apiResponse.data.activities.validateMission;
        await store.syncEntity(
          [parseMissionPayloadFromBackend(mission)],
          "missions",
          m => m.id === mission.id
        );
      }
    );
  };

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
    };

    await submitAction(
      LOG_EXPENDITURE_MUTATION,
      newExpenditure,
      updateStore,
      ["expenditures"],
      apiResponse => {
        const expenditures = apiResponse.data.activities.logExpenditure;
        store.syncEntity(
          expenditures,
          "expenditures",
          e =>
            e.missionId ===
            (expenditures.length > 0 ? expenditures[0].missionId : missionId)
        );
      },
      true,
      error => {
        if (isGraphQLError(error)) {
          displayApiErrors({
            apiErrors: error.graphQLErrors,
            actionDescription: "Le frais",
            hasRequestFailed: true,
            shouldReload: false
          });
        }
      }
    );
  };

  const cancelExpenditure = async expenditureToCancel => {
    if (isPendingSubmission(expenditureToCancel)) {
      if (
        api.isCurrentlySubmittingRequests() ||
        expenditureToCancel.pendingUpdate.type === "delete"
      )
        return;

      store.clearPendingRequest(expenditureToCancel.pendingUpdate.requestId);
    }

    const updateStore = (store, requestId) => {
      store.deleteEntityObject(
        expenditureToCancel.id,
        "expenditures",
        requestId
      );
    };

    await submitAction(
      CANCEL_EXPENDITURE_MUTATION,
      { expenditureId: expenditureToCancel.id },
      updateStore,
      ["expenditures"],
      apiResponse => {
        const expenditures = apiResponse.data.activities.cancelExpenditure;
        store.syncEntity(
          expenditures,
          "expenditures",
          e =>
            e.missionId ===
            (expenditures.length > 0
              ? expenditures[0].missionId
              : expenditureToCancel.missionId)
        );
      },
      true
    );
  };

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
        editExpenditures
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export const useActions = () => React.useContext(ActionsContext);
