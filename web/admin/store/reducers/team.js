import { currentUserId } from "common/utils/cookie";
import { computeUsersInValidationFilter } from "./validationsFilters";
import uniqBy from "lodash/uniqBy";

export function updateTeamsReducer(state, { teams, employments }) {
  const adminedTeams = teams.filter(team =>
    team.adminUsers?.some(u => u.id === currentUserId())
  );

  const usersWithoutTeam = uniqBy(
    employments
      ?.filter(
        employment =>
          !employment.teamId && employment.user && employment.isAcknowledged
      )
      .map(employment => employment.user),
    u => u.id
  );
  const usersInValidationFilter = computeUsersInValidationFilter(
    adminedTeams,
    usersWithoutTeam
  );

  return {
    ...state,
    validationsFilters: {
      ...state.validationsFilters,
      users: usersInValidationFilter,
      teams: adminedTeams
    }
  };
}
