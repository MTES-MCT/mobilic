import { updateItemReducer } from "./crud";

export function createExpenditureReducer(state, { expenditure }) {
  const mission = state.missions.find(m => m.id === expenditure.missionId);
  if (mission) {
    return updateItemReducer(state, {
      id: mission.id,
      entity: "missions",
      update: { expenditures: [...mission.expenditures, expenditure] }
    });
  }
  return state;
}

export function deleteExpenditureReducer(state, { expenditure }) {
  const mission = state.missions.find(m => m.id === expenditure.missionId);
  if (mission) {
    return updateItemReducer(state, {
      id: mission.id,
      entity: "missions",
      update: {
        expenditures: mission.expenditures.filter(e => e.id !== expenditure.id)
      }
    });
  }
  return state;
}
