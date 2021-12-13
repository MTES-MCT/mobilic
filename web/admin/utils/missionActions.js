import {
  ACTIVITIES,
  ACTIVITIES_OPERATIONS,
  convertBreakIntoActivityOperations
} from "common/utils/activities";
import {
  buildLogLocationPayloadFromAddress,
  CANCEL_ACTIVITY_MUTATION,
  CANCEL_COMMENT_MUTATION,
  CANCEL_EXPENDITURE_MUTATION,
  CHANGE_MISSION_NAME_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  LOG_ACTIVITY_MUTATION,
  LOG_COMMENT_MUTATION,
  LOG_EXPENDITURE_MUTATION,
  LOG_LOCATION_MUTATION,
  REGISTER_KILOMETER_AT_LOCATION,
  UPDATE_MISSION_VEHICLE_MUTATION
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";

async function cancelActivity(api, mission, activity, user, activities) {
  if (activity.type === ACTIVITIES.break.name) {
    const ops = convertBreakIntoActivityOperations(
      activities,
      activity.endTime,
      activity.endTime,
      user.id,
      true
    );
    return await executeActivityOps(api, mission, ops, user);
  }
  await api.nonConcurrentQueryQueue.execute(() =>
    api.graphQlMutate(CANCEL_ACTIVITY_MUTATION, {
      activityId: activity.id
    })
  );
  mission.activities = mission.activities.filter(a => a.id !== activity.id);
}

async function createActivity(api, mission, user, newValues, activities) {
  if (newValues.type === ACTIVITIES.break.name) {
    const ops = convertBreakIntoActivityOperations(
      activities,
      newValues.displayedStartTime,
      newValues.displayedEndTime,
      user.id
    );
    return await executeActivityOps(api, mission, ops, user);
  }
  const apiResponse = await api.nonConcurrentQueryQueue.execute(() =>
    api.graphQlMutate(LOG_ACTIVITY_MUTATION, {
      type: newValues.type,
      startTime: newValues.displayedStartTime,
      endTime: newValues.displayedEndTime,
      missionId: mission.id,
      userId: user.id,
      switch: false
    })
  );
  const activity = apiResponse.data.activities.logActivity;
  mission.activities = [...mission.activities, { ...activity, user }];
}

async function editActivity(
  api,
  mission,
  activity,
  newValues,
  user,
  activities
) {
  if (activity.type === ACTIVITIES.break.name) {
    const ops = convertBreakIntoActivityOperations(
      activities,
      newValues.displayedStartTime,
      newValues.displayedEndTime,
      user.id,
      true
    );
    return await executeActivityOps(api, mission, ops, user);
  }
  await api.nonConcurrentQueryQueue.execute(() =>
    api.graphQlMutate(EDIT_ACTIVITY_MUTATION, {
      activityId: activity.id,
      startTime: newValues.displayedStartTime,
      endTime: newValues.displayedEndTime
    })
  );
  mission.activities = mission.activities.map(a =>
    a.id === activity.id
      ? {
          ...a,
          startTime: newValues.displayedStartTime,
          endTime: newValues.displayedEndTime
        }
      : a
  );
}

async function executeActivityOps(api, mission, ops, user) {
  return await Promise.all(
    ops.map(op => {
      if (op.operation === ACTIVITIES_OPERATIONS.cancel)
        return cancelActivity(api, mission, op.activity, user);
      if (op.operation === ACTIVITIES_OPERATIONS.update)
        return editActivity(
          api,
          mission,
          op.activity,
          {
            displayedStartTime: op.startTime,
            displayedEndTime: op.endTime
          },
          user
        );
      if (op.operation === ACTIVITIES_OPERATIONS.create)
        return createActivity(api, mission, user, {
          type: op.type,
          displayedStartTime: op.startTime,
          displayedEndTime: op.endTime
        });
    })
  );
}

async function createExpenditure(
  api,
  mission,
  { type, spendingDate, userId = null }
) {
  const apiResponse = await api.nonConcurrentQueryQueue.execute(() =>
    api.graphQlMutate(LOG_EXPENDITURE_MUTATION, {
      type,
      userId,
      missionId: mission.id,
      spendingDate: spendingDate
    })
  );
  const expenditure = apiResponse.data.activities.logExpenditure;
  mission.expenditures.push(expenditure);
}

async function cancelExpenditure(api, mission, { expenditure }) {
  await api.nonConcurrentQueryQueue.execute(() =>
    api.graphQlMutate(CANCEL_EXPENDITURE_MUTATION, {
      expenditureId: expenditure.id
    })
  );
  mission.expenditures = mission.expenditures.filter(
    e => e.id !== expenditure.id
  );
}

async function createComment(api, mission, text) {
  const apiResponse = await api.graphQlMutate(LOG_COMMENT_MUTATION, {
    text,
    missionId: mission.id
  });
  const comment = apiResponse.data.activities.logComment;
  mission.comments.push(comment);
}

async function deleteComment(api, mission, comment) {
  await api.graphQlMutate(CANCEL_COMMENT_MUTATION, {
    commentId: comment.id
  });
  mission.comments = mission.comments.filter(c => c.id !== comment.id);
}

async function changeName(api, mission, name) {
  await api.graphQlMutate(CHANGE_MISSION_NAME_MUTATION, {
    missionId: mission.id,
    name
  });
  mission.name = name;
}

async function updateVehicle(api, mission, vehicle) {
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

async function updateKilometerReading(api, mission, kilometerReading, isStart) {
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
    await action(api, mission, ...args);
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
    createActivity: missionActionsDecorator(createActivity),
    editActivity: missionActionsDecorator(editActivity),
    cancelActivity: missionActionsDecorator(cancelActivity),
    createExpenditure: missionActionsDecorator(createExpenditure),
    cancelExpenditure: missionActionsDecorator(cancelExpenditure),
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
