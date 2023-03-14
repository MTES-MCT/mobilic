import flatMap from "lodash/flatMap";
import uniqBy from "lodash/uniqBy";
import { computeUsersAndTeamFilters } from "./team";

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
      teams: usersAndTeamsFilters.activitiesFilters.teams,
      users: usersAndTeamsFilters.activitiesFilters.users
    },
    validationsFilters: {
      ...state.validationsFilters,
      teams: usersAndTeamsFilters.validationsFilters.teams,
      users: usersAndTeamsFilters.validationsFilters.users
    }
  };
}
