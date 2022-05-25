export function addVirtualActivityReducer(state, { virtualActivity }) {
  return {
    ...state,
    virtualActivities: [...state.virtualActivities, virtualActivity]
  };
}

export function removeAllVirtualActivitiesReducer(state) {
  return {
    ...state,
    virtualActivities: []
  };
}
