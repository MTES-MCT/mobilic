import { createItemsReducer, updateItemReducer } from "./crud";

export function validateMissionReducer(state, { missionResponse }) {
  const mission = state.missions.find(m => m.id === missionResponse.id);
  if (mission) {
    return updateItemReducer(state, {
      id: mission.id,
      entity: "missions",
      update: { validations: missionResponse.validations }
    });
  }
  return state;
}

export function putAsideOriginalMissionsReducer(state, { missionId }) {
  const mission = state.missions.find(m => m.id === missionId);
  if (mission) {
    return createItemsReducer(state, {
      entity: "originalMissions",
      items: [
        {
          id: mission.id,
          activities: [...mission.activities],
          expenditures: [...mission.expenditures] || []
        }
      ]
    });
  }
  return state;
}

export function revertMissionToOriginalValuesReducer(state, { missionId }) {
  const originalMission = state.originalMissions.find(m => m.id === missionId);
  if (originalMission) {
    return updateItemReducer(state, {
      id: originalMission.id,
      entity: "missions",
      update: {
        activities: [...originalMission.activities],
        expenditures: [...originalMission.expenditures] || []
      }
    });
  }
  return state;
}
