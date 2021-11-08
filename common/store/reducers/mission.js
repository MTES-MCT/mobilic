import mapValues from "lodash/mapValues";

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
