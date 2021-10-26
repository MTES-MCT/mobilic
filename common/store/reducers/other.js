import zipObject from "lodash/zipObject";
import { LOCAL_STORAGE_SCHEMA } from "../schemas";
import { List } from "../types";
import { hasPendingUpdates, removePendingVersion } from "../offline";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import { entitySelector } from "../selectors";

export function removeOptimisticUpdateReducer(state, { requestId, entities }) {
  return {
    ...state,
    ...zipObject(
      entities,
      entities.map(entity => {
        if (LOCAL_STORAGE_SCHEMA[entity] === List) {
          return state[entity]
            .map(item => removePendingVersion(item, requestId))
            .filter(value => !!value);
        }
        return pickBy(
          mapValues(state[entity], item =>
            removePendingVersion(item, requestId)
          ),
          value => !!value
        );
      })
    )
  };
}

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

export function removeTemporaryMissionIdReducer(
  state,
  { tempMissionId, missionId }
) {
  return {
    ...state,
    activities: mapValues(state.activities, a => ({
      ...a,
      missionId: a.missionId === tempMissionId ? missionId : a.missionId
    })),
    expenditures: mapValues(state.expenditures, e => ({
      ...e,
      missionId: e.missionId === tempMissionId ? missionId : e.missionId
    }))
  };
}
