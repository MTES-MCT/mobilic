import flatMap from "lodash/flatMap";
import uniqBy from "lodash/uniqBy";
import { computeUsersAndTeamFilters } from "./team";
import { preserveSelected } from "./sync";

export function addUsersReducer(state, { companiesPayload }) {
  const users = flatMap(
    companiesPayload.map(c => c.users.map(u => ({ ...u, companyId: c.id })))
  );
  const newUsers = uniqBy(users, u => u.id);

  const usersAndTeamsFilters = computeUsersAndTeamFilters(
    users,
    state.employments,
    state.teams
  );

  return {
    ...state,
    users: newUsers,
    activitiesFilters: {
      ...state.activitiesFilters,
      teams: preserveSelected(usersAndTeamsFilters.activitiesFilters.teams, state.activitiesFilters.teams),
      users: preserveSelected(usersAndTeamsFilters.activitiesFilters.users, state.activitiesFilters.users)
    },
    validationsFilters: {
      ...state.validationsFilters,
      teams: preserveSelected(usersAndTeamsFilters.validationsFilters.teams, state.validationsFilters.teams),
      users: preserveSelected(usersAndTeamsFilters.validationsFilters.users, state.validationsFilters.users)
    },
    exportFilters: {
      ...state.exportFilters,
      teams: usersAndTeamsFilters.exportFilters.teams,
      users: usersAndTeamsFilters.exportFilters.users
    }
  };
}
