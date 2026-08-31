import { VIRTUAL_EXPENDITURES_ACTIONS } from "../store/store";
import { ACTIVITIES, ACTIVITIES_OPERATIONS } from "common/utils/activities";
import { sameMinute } from "common/utils/time";

export const getPayloadFromVirtualActivities = virtualActivities => {
  return virtualActivities.map(virtualActivity => ({
    [virtualActivity.action.backendVerb]: {
      ...virtualActivity.payload
    }
  }));
};

export const getPayloadFromVirtualExpenditures = expenditureActions => {
  return {
    expendituresCancelIds: expenditureActions
      .filter(
        expenditureAction =>
          expenditureAction.action === VIRTUAL_EXPENDITURES_ACTIONS.cancel
      )
      .map(expenditureAction => expenditureAction.payload.expenditureId),
    expendituresInputs: expenditureActions
      .filter(
        expenditureAction =>
          expenditureAction.action === VIRTUAL_EXPENDITURES_ACTIONS.create
      )
      .map(expenditureAction => expenditureAction.payload)
  };
};

export const getPayloadCreateActivity = (args, mission) => {
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

export const getPayloadUpdateActivity = (
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
