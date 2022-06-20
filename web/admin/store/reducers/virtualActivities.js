export const reduceVirtualActivities = (previousArray, newVirtualActivity) => {
  switch (newVirtualActivity.action) {
    case "CREATE":
      return [...previousArray, newVirtualActivity];
    case "CANCEL":
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
    case "EDIT":
      if (
        previousArray.find(v => v.activityId === newVirtualActivity.activityId)
      ) {
        return previousArray.map(prevEntry =>
          prevEntry.id === newVirtualActivity.activityId
            ? {
                ...prevEntry,
                ...newVirtualActivity
              }
            : prevEntry
        );
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

export function removeAllVirtualActivitiesReducer(state) {
  return {
    ...state,
    virtualActivities: []
  };
}
