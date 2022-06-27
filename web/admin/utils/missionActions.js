import { v4 as uuidv4 } from "uuid";
import { ACTIVITIES, ACTIVITIES_OPERATIONS } from "common/utils/activities";
import {
  buildLogLocationPayloadFromAddress,
  CANCEL_COMMENT_MUTATION,
  CANCEL_EXPENDITURE_MUTATION,
  CHANGE_MISSION_NAME_MUTATION,
  LOG_COMMENT_MUTATION,
  LOG_EXPENDITURE_MUTATION,
  LOG_LOCATION_MUTATION,
  REGISTER_KILOMETER_AT_LOCATION,
  UPDATE_MISSION_VEHICLE_MUTATION,
  VALIDATE_MISSION_MUTATION,
  BULK_ACTIVITY_MUTATION
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { sameMinute } from "common/utils/time";
import { currentUserId } from "common/utils/cookie";
import { reduceVirtualActivities } from "../store/reducers/virtualActivities";

const testBulkActivities = async (api, virtualActivities) => {
  if (virtualActivities.length > 0) {
    return await api.nonConcurrentQueryQueue.execute(() =>
      api.graphQlMutate(BULK_ACTIVITY_MUTATION, {
        items: virtualActivities.map(virtualActivity => {
          const verb =
            virtualActivity.action === "CREATE"
              ? "log"
              : virtualActivity.action === "EDIT"
              ? "edit"
              : "cancel";

          return {
            [verb]: { ...virtualActivity.payload }
          };
        })
      })
    );
  }
};

export const applyBulkActivities = async (api, virtualActivities) => {
  // do differently
  // return await callBulkActivities(api, virtualActivities, false);
};

export const applyExpenditureActions = async (api, expenditureActions) => {
  for (const expenditureAction of expenditureActions) {
    if (expenditureAction.action === "create") {
      await api.nonConcurrentQueryQueue.execute(() =>
        api.graphQlMutate(LOG_EXPENDITURE_MUTATION, {
          ...expenditureAction.payload
        })
      );
    }
    if (expenditureAction.action === "cancel") {
      await api.nonConcurrentQueryQueue.execute(() =>
        api.graphQlMutate(CANCEL_EXPENDITURE_MUTATION, {
          ...expenditureAction.payload
        })
      );
    }
  }
};

const getPayloadCreate = (args, mission) => {
  let activityType = args.activityType;
  if (
    args.activityType === ACTIVITIES.drive.name &&
    args.driverId &&
    args.user.id !== args.driverId
  ) {
    activityType = ACTIVITIES.support.name;
  }
  const payload = {
    type: activityType,
    startTime: args.startTime,
    endTime: args.endTime,
    missionId: mission.id,
    userId: args.user.id,
    switch: false
  };
  if (args.userComment) payload.context = { userComment: args.userComment };
  return payload;
};

const getPayloadUpdate = (
  activity,
  actionType,
  newStartTime,
  newEndTime,
  userComment
) => {
  const activityId = activity.id;
  const payload = {
    activityId
  };
  if (userComment) payload.context = { userComment };
  let shouldCancel = actionType === ACTIVITIES_OPERATIONS.cancel;

  const updatedStartTime = newStartTime || activity.startTime;
  const updatedEndTime = newEndTime || activity.endTime;
  if (updatedEndTime && sameMinute(updatedStartTime, updatedEndTime)) {
    shouldCancel = true;
  }

  if (!shouldCancel) {
    payload.startTime = newStartTime;
    payload.endTime = newEndTime;
    payload.removeEndTime = !newEndTime;
  }
  return {
    payload,
    shouldCancel
  };
};

async function severalActionsActivity(api, mission, adminStore, modalArgs) {
  let tmpVirtualActivities = adminStore.virtualActivities;
  const toDispatch = [];

  for (const arg of modalArgs) {
    if (arg.type === "update") {
      const {
        activity,
        actionType,
        newStartTime,
        newEndTime,
        userComment
      } = arg.payload;
      const { payload, shouldCancel } = getPayloadUpdate(
        activity,
        actionType,
        newStartTime,
        newEndTime,
        userComment
      );
      tmpVirtualActivities = reduceVirtualActivities(tmpVirtualActivities, {
        action: shouldCancel ? "CANCEL" : "EDIT",
        payload,
        activityId: activity.id
      });

      // check ok
      await testBulkActivities(api, tmpVirtualActivities);

      // update
      if (shouldCancel) {
        mission.activities = mission.activities.filter(
          a => a.id !== activity.id
        );
      } else {
        mission.activities = mission.activities.map(a =>
          a.id === activity.id
            ? {
                ...a,
                startTime: newStartTime,
                endTime: newEndTime,
                lastSubmitterId: currentUserId()
              }
            : a
        );
      }
      toDispatch.push({
        type: ADMIN_ACTIONS.addVirtualActivity,
        payload: {
          virtualActivity: {
            action: shouldCancel ? "CANCEL" : "EDIT",
            payload,
            activityId: activity.id
          }
        }
      });
    }
    if (arg.type === "create") {
      const payload = getPayloadCreate(arg.payload, mission);
      tmpVirtualActivities = reduceVirtualActivities(tmpVirtualActivities, {
        action: "CREATE",
        payload,
        activityId: uuidv4()
      });

      // check ok
      const apiResponse = await testBulkActivities(api, tmpVirtualActivities);

      // apply changes
      const activity = apiResponse.data.activities.bulkActivities;
      mission.activities = [
        ...mission.activities,
        { ...activity, user: modalArgs.user }
      ];
      toDispatch.push({
        type: ADMIN_ACTIONS.addVirtualActivity,
        payload: {
          virtualActivity: {
            action: "CREATE",
            payload,
            activityId: activity.id
          }
        }
      });
    }
  }

  toDispatch.forEach(payload => adminStore.dispatch(payload));
}

async function createSingleActivity(api, mission, adminStore, modalArgs) {
  const payload = getPayloadCreate(modalArgs, mission);

  const tmpNewVirtualActivity = {
    action: "CREATE",
    payload,
    activityId: uuidv4()
  };
  // let's validate adding new virtual activity would be ok
  const apiResponse = await testBulkActivities(
    api,
    reduceVirtualActivities(adminStore.virtualActivities, tmpNewVirtualActivity)
  );
  const activity = apiResponse.data.activities.bulkActivities;
  mission.activities = [
    ...mission.activities,
    { ...activity, user: modalArgs.user }
  ];

  adminStore.dispatch({
    type: ADMIN_ACTIONS.addVirtualActivity,
    payload: {
      virtualActivity: {
        action: "CREATE",
        payload,
        activityId: activity.id
      }
    }
  });
}

async function editSingleActivity(
  api,
  mission,
  adminStore,
  activity,
  actionType,
  newStartTime,
  newEndTime,
  userComment
) {
  const { payload, shouldCancel } = getPayloadUpdate(
    activity,
    actionType,
    newStartTime,
    newEndTime,
    userComment
  );

  if (!shouldCancel) {
    // check if edit is ok or not
    const tmpNewVirtualActivity = {
      action: "EDIT",
      payload,
      activityId: activity.id
    };
    await testBulkActivities(
      api,
      reduceVirtualActivities(
        adminStore.virtualActivities,
        tmpNewVirtualActivity
      )
    );
  }

  if (shouldCancel) {
    mission.activities = mission.activities.filter(a => a.id !== activity.id);
  } else {
    mission.activities = mission.activities.map(a =>
      a.id === activity.id
        ? {
            ...a,
            startTime: newStartTime,
            endTime: newEndTime,
            lastSubmitterId: currentUserId()
          }
        : a
    );
  }
  adminStore.dispatch({
    type: ADMIN_ACTIONS.addVirtualActivity,
    payload: {
      virtualActivity: {
        action: shouldCancel ? "CANCEL" : "EDIT",
        payload,
        activityId: activity.id
      }
    }
  });
}

async function createExpenditure(
  api,
  mission,
  adminStore,
  { type, spendingDate, userId = null }
) {
  const expenditure = {
    type,
    userId,
    missionId: mission.id,
    spendingDate: spendingDate
  };
  adminStore.dispatch({
    type: ADMIN_ACTIONS.addVirtualExpenditureAction,
    payload: {
      virtualExpenditureAction: {
        action: "create",
        payload: expenditure
      }
    }
  });
  mission.expenditures.push({
    ...expenditure,
    id: uuidv4()
  });
}

async function cancelExpenditure(api, mission, adminStore, { expenditure }) {
  adminStore.dispatch({
    type: ADMIN_ACTIONS.addVirtualExpenditureAction,
    payload: {
      virtualExpenditureAction: {
        action: "cancel",
        payload: { expenditureId: expenditure.id }
      }
    }
  });
  mission.expenditures = mission.expenditures.filter(
    e => e.id !== expenditure.id
  );
}

async function createComment(api, mission, adminStore, text) {
  const apiResponse = await api.graphQlMutate(LOG_COMMENT_MUTATION, {
    text,
    missionId: mission.id
  });
  const comment = apiResponse.data.activities.logComment;
  mission.comments.push(comment);
}

async function validateMission(api, mission, adminStore, userToValidate) {
  const apiResponse = await api.graphQlMutate(VALIDATE_MISSION_MUTATION, {
    missionId: mission.id,
    userId: userToValidate
  });
  const validation = apiResponse.data.activities.validateMission;
  mission.validations.push(validation);
}

async function deleteComment(api, mission, adminStore, comment) {
  await api.graphQlMutate(CANCEL_COMMENT_MUTATION, {
    commentId: comment.id
  });
  mission.comments = mission.comments.filter(c => c.id !== comment.id);
}

async function changeName(api, mission, adminStore, name) {
  await api.graphQlMutate(CHANGE_MISSION_NAME_MUTATION, {
    missionId: mission.id,
    name
  });
  mission.name = name;
}

async function updateVehicle(api, mission, adminStore, vehicle) {
  await api.graphQlMutate(UPDATE_MISSION_VEHICLE_MUTATION, {
    missionId: mission.id,
    vehicleId: vehicle.id,
    vehicleRegistrationNumber: vehicle.registrationNumber
  });
  mission.vehicle = vehicle;
}

async function updateLocation(
  api,
  mission,
  adminStore,
  address,
  isStart,
  kilometerReading
) {
  const payload = buildLogLocationPayloadFromAddress(
    address,
    mission.id,
    isStart,
    kilometerReading || null
  );

  const apiResponse = await api.graphQlMutate(LOG_LOCATION_MUTATION, {
    ...payload,
    overrideExisting: true
  });
  mission[isStart ? "startLocation" : "endLocation"] =
    apiResponse.data.activities.logLocation;
}

async function updateKilometerReading(
  api,
  mission,
  adminStore,
  kilometerReading,
  isStart
) {
  await api.graphQlMutate(REGISTER_KILOMETER_AT_LOCATION, {
    missionLocationId: mission[isStart ? "startLocation" : "endLocation"].id,
    kilometerReading
  });
  mission[isStart ? "startLocation" : "endLocation"] = {
    ...mission[isStart ? "startLocation" : "endLocation"],
    kilometerReading
  };
}

const missionActionWrapper = (
  alerts,
  api,
  mission,
  adminStore,
  setShouldRefreshActivityPanel,
  setMission
) => (action, shouldRefreshActivityPanel = true) => async (...args) => {
  await alerts.withApiErrorHandling(async () => {
    if (shouldRefreshActivityPanel) {
      setShouldRefreshActivityPanel(true);
    }
    await action(api, mission, adminStore, ...args);
    setMission({ ...mission });
    adminStore.dispatch({
      type: ADMIN_ACTIONS.update,
      payload: { id: mission.id, entity: "missions", update: mission }
    });
  });
};

export function useMissionActions(
  mission,
  setMission,
  setShouldRefreshActivityPanel
) {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();

  const missionActionsDecorator = missionActionWrapper(
    alerts,
    api,
    mission,
    adminStore,
    setShouldRefreshActivityPanel,
    setMission
  );

  return {
    createSingleActivity: missionActionsDecorator(createSingleActivity),
    editSingleActivity: missionActionsDecorator(editSingleActivity),
    severalActionsActivity: missionActionsDecorator(severalActionsActivity),
    createExpenditure: missionActionsDecorator(createExpenditure),
    cancelExpenditure: missionActionsDecorator(cancelExpenditure),
    validateMission: missionActionsDecorator(validateMission),
    createComment: missionActionsDecorator(createComment, false),
    deleteComment: missionActionsDecorator(deleteComment, false),
    changeName: missionActionsDecorator(changeName),
    updateVehicle: missionActionsDecorator(updateVehicle, false),
    updateLocation: missionActionsDecorator(updateLocation, false),
    updateKilometerReading: missionActionsDecorator(
      updateKilometerReading,
      false
    )
  };
}
