export function updateCompanyDeletedMissionsReducer(
  state,
  { companyId, missionsDeleted }
) {
  const deletedMissions = missionsDeleted.edges.map(m => ({
    ...m.node,
    companyId: companyId,
    isDeleted: true
  }));

  const regularMissions = state.missions.filter(m => !m.isDeleted);

  const missions = deletedMissions.concat(regularMissions);

  return {
    ...state,
    missions
  };
}
