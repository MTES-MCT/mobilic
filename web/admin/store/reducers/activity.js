import { updateItemReducer } from "./crud";

export function createOrSyncActivityReducer(state, { activity }) {
  const mission = state.missions.find(m => m.id === activity.missionId);
  const user = state.users.find(u => u.id === activity.userId);
  if (mission) {
    return updateItemReducer(state, {
      id: mission.id,
      entity: "missions",
      update: {
        activities: [
          ...mission.activities.filter(a => a.id !== activity.id),
          { ...activity, user }
        ]
      }
    });
  }
  return state;
}

export function deleteActivityReducer(state, { activity }) {
  const mission = state.missions.find(m => m.id === activity.missionId);
  if (mission) {
    return updateItemReducer(state, {
      id: mission.id,
      entity: "missions",
      update: {
        activities: mission.activities.filter(a => a.id !== activity.id)
      }
    });
  }
  return state;
}
