export function updateActivitiesFiltersReducer(state, payload) {
  return {
    ...state,
    activitiesFilters: {
      ...state.activitiesFilters,
      ...payload
    }
  };
}
