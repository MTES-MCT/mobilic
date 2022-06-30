import { VIRTUAL_ACTIVITIES_ACTIONS } from "../store";

export const reduceVirtualActivities = (previousArray, newVirtualActivity) => {
  switch (newVirtualActivity.action) {
    case VIRTUAL_ACTIVITIES_ACTIONS.create:
      return [...previousArray, newVirtualActivity];
    case VIRTUAL_ACTIVITIES_ACTIONS.cancel:
      if (
        previousArray.find(v => v.activityId === newVirtualActivity.activityId)
      ) {
        // activity has been created previously, let's remove it
        return [
          ...previousArray.filter(
            v => v.activityId !== newVirtualActivity.activityId
          )
        ];
      } else {
        // need to cancel existing activity
        return [...previousArray, newVirtualActivity];
      }
    case VIRTUAL_ACTIVITIES_ACTIONS.edit:
      if (
        previousArray.find(v => v.activityId === newVirtualActivity.activityId)
      ) {
        return previousArray.map(prevEntry => {
          if (prevEntry.activityId !== newVirtualActivity.activityId) {
            return prevEntry;
          }
          let entry = prevEntry;
          for (const key of Object.keys(entry.payload)) {
            if (newVirtualActivity.payload[key]) {
              entry.payload[key] = newVirtualActivity.payload[key];
            }
          }
          return entry;
        });
      } else {
        return [...previousArray, newVirtualActivity];
      }
    default:
      return previousArray;
  }
};

export function addVirtualActivityReducer(state, { virtualActivity }) {
  return {
    ...state,
    virtualActivities: reduceVirtualActivities(
      state.virtualActivities,
      virtualActivity
    )
  };
}

export function resetVirtualReducer(state) {
  return {
    ...state,
    virtualActivities: [],
    virtualExpenditureActions: []
  };
}
