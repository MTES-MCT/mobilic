import { ACTIVITIES, ACTIVITIES_OPERATIONS } from "common/utils/activities";
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
  UPDATE_MISSION_VEHICLE_MUTATION,
  VALIDATE_MISSION_MUTATION
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { sameMinute } from "common/utils/time";
import { currentUserId } from "common/utils/cookie";

async function createSingleActivity(api, mission, modalArgs) {
  let activityType = modalArgs.activityType;
  if (
    modalArgs.activityType === ACTIVITIES.drive.name &&
    modalArgs.driverId &&
    modalArgs.user.id !== modalArgs.driverId
  ) {
    activityType = ACTIVITIES.support.name;
  }
  const payload = {
    type: activityType,
    startTime: modalArgs.startTime,
    endTime: modalArgs.endTime,
    missionId: mission.id,
    userId: modalArgs.user.id,
    switch: false,
    virtual: true
  };

  if (modalArgs.userComment)
    payload.context = { userComment: modalArgs.userComment };

  const apiResponse = await api.nonConcurrentQueryQueue.execute(() =>
    api.graphQlMutate(LOG_ACTIVITY_MUTATION, payload)
  );
  const activity = apiResponse.data.activities.logActivity;
  mission.activities = [
    ...mission.activities,
    { ...activity, user: modalArgs.user }
  ];
}

async function editSingleActivity(
  api,
  mission,
  activity,
  actionType,
  newStartTime,
  newEndTime,
  userComment
) {
  const payload = {
    activityId: activity.id
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

  await api.nonConcurrentQueryQueue.execute(() =>
    api.graphQlMutate(
      shouldCancel ? CANCEL_ACTIVITY_MUTATION : EDIT_ACTIVITY_MUTATION,
      payload
    )
  );
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

async function validateMission(api, mission, userToValidate) {
  const apiResponse = await api.graphQlMutate(VALIDATE_MISSION_MUTATION, {
    missionId: mission.id,
    userId: userToValidate
  });
  const validation = apiResponse.data.activities.validateMission;
  mission.validations.push(validation);
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
    createSingleActivity: missionActionsDecorator(createSingleActivity),
    editSingleActivity: missionActionsDecorator(editSingleActivity),
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
