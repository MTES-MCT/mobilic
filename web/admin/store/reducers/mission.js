import { updateItemReducer } from "./crud";

export function validateMissionReducer(state, { validation }) {
  const mission = state.missions.find(m => m.id === validation.mission.id);
  if (mission) {
    return updateItemReducer(state, {
      id: mission.id,
      entity: "missions",
      update: { validations: [...mission.validations, validation] }
    });
  }
  return state;
}
