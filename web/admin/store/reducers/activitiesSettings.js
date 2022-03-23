export function updateActivitiesSettingsReducer(state, payload) {
  return {
    ...state,
    activitiesSettings: {
      ...state.activitiesSettings,
      ...payload
    }
  };
}
