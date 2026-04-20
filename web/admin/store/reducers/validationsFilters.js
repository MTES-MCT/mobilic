export function updateValidationsFiltersReducer(state, payload) {
  return {
    ...state,
    validationsFilters: {
      ...state.validationsFilters,
      ...payload
    }
  };
}

export function computeUsersInValidationFilter(allCompanyUsers, adminedTeams, usersWithoutTeam) {
  return allCompanyUsers.reduce((accumulator, currentUser) => {
    const foundTeam = adminedTeams.find(team =>
      team.users?.some(u => u.id === currentUser.id)
    );
    if (foundTeam) {
      accumulator.push({
        ...currentUser,
        teamId: foundTeam.id,
        teamName: foundTeam.name
      });
    } else {
      if (usersWithoutTeam.some(u => u.id === currentUser.id)) {
        accumulator.push({
          ...currentUser
        });
      }
    }
    return accumulator;
  }, []);
}
