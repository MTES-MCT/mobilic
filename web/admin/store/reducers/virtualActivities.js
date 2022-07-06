import { VIRTUAL_ACTIVITIES_ACTIONS } from "../store";

export const reduceVirtualActivities = (previousArray, newVirtualActivity) => {
  switch (newVirtualActivity.action) {
    case VIRTUAL_ACTIVITIES_ACTIONS.create:
      return [...previousArray, newVirtualActivity];
    case VIRTUAL_ACTIVITIES_ACTIONS.cancel: {
      const existingActivity = previousArray.find(
        v => v.activityId === newVirtualActivity.activityId
      );
      if (existingActivity) {
        // activity has been created / edited previously on front, let's remove the previous action
        // and add the cancel one if this activity is not only on front side
        return [
          ...(existingActivity.virtual !== true ? [newVirtualActivity] : []),
          ...previousArray.filter(
            v => v.activityId !== newVirtualActivity.activityId
          )
        ];
      } else {
        // need to cancel existing activity
        return [newVirtualActivity, ...previousArray];
      }
    }
    case VIRTUAL_ACTIVITIES_ACTIONS.edit:
      return editReducer(previousArray, newVirtualActivity);

    default:
      return previousArray;
  }
};

const editReducer = (previousArray, newVirtualActivity) => {
  let entryAlreadyHere = previousArray.find(
    v => v.activityId === newVirtualActivity.activityId
  );

  if (!entryAlreadyHere) {
    return [...previousArray, newVirtualActivity];
  }

  const otherItems = previousArray.filter(
    v => v.activityId !== newVirtualActivity.activityId
  );
  for (const key of Object.keys(entryAlreadyHere.payload)) {
    if (newVirtualActivity.payload[key]) {
      entryAlreadyHere.payload[key] = newVirtualActivity.payload[key];
    }
  }
  return [...otherItems, entryAlreadyHere];
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
