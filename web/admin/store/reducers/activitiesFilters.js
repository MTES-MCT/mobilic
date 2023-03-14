export function updateActivitiesFiltersReducer(state, payload) {
  return {
    ...state,
    activitiesFilters: {
      ...state.activitiesFilters,
      ...payload
    }
  };
}

export function computeUsersInActivityFilter(
  allCompanyUsers,
  adminedTeams,
  usersWithoutTeam
) {
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

export function computeTeamsInActivityFilter(
  usersInActivityFilter,
  adminedTeams
) {
  return adminedTeams.filter(team =>
    usersInActivityFilter.some(u => u.teamId === team.id)
  );
}
