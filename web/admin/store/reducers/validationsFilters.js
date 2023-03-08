export function updateValidationsFiltersReducer(state, payload) {
  return {
    ...state,
    validationsFilters: {
      ...state.validationsFilters,
      ...payload
    }
  };
}

export function computeUsersInValidationFilter(adminedTeams, usersWithoutTeam) {
  return adminedTeams.reduce(
    (accumulator, currentTeam) =>
      accumulator.concat(
        currentTeam.users.map(user => ({
          ...user,
          teamId: currentTeam.id,
          teamName: currentTeam.name
        }))
      ),
    usersWithoutTeam || []
  );
}
