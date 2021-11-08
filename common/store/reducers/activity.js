import values from "lodash/values";
import { entitySelector } from "../selectors";
import { hasPendingUpdates } from "../offline";

export function closeCurrentActivityReducer(
  state,
  { activity, tempActivityId, requestId }
) {
  const previousActivity = values(entitySelector("activities")(state)).find(
    a =>
      a.userId === activity.userId &&
      a.id !== tempActivityId &&
      hasPendingUpdates(a) &&
      a.pendingUpdates.some(
        upd => upd.type === "update" && upd.requestId === requestId
      )
  );
  return previousActivity
    ? {
        ...state,
        activities: {
          ...state.activities,
          [previousActivity.id.toString()]: {
            ...previousActivity,
            endTime: activity.startTime
          }
        }
      }
    : state;
}
