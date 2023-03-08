import { currentUserId } from "common/utils/cookie";
import { computeUsersInValidationFilter } from "./validationsFilters";
import uniqBy from "lodash/uniqBy";
import {
  computeTeamsInActivityFilter,
  computeUsersInActivityFilter
} from "./activitiesFilters";

function getUsersWithoutTeam(employments) {
  const usersWithoutTeam = uniqBy(
    employments
      ?.filter(
        employment =>
          !employment.teamId && employment.user && employment.isAcknowledged
      )
      .map(employment => employment.user),
    u => u.id
  );
  return usersWithoutTeam;
}

export function computeUsersAndTeamFilters(users, employments, teams) {
  const adminedTeams = teams.filter(team =>
    team.adminUsers?.some(u => u.id === currentUserId())
  );

  const usersWithoutTeam = getUsersWithoutTeam(employments);

  const usersInValidationFilter = computeUsersInValidationFilter(
    adminedTeams,
    usersWithoutTeam
  );

  const usersInActivityFilter = computeUsersInActivityFilter(
    uniqBy(users, u => u.id),
    adminedTeams,
    usersWithoutTeam
  );

  const teamsInActivityFilter = computeTeamsInActivityFilter(
    usersInActivityFilter,
    adminedTeams
  );

  return {
    activitiesFilters: {
      teams: teamsInActivityFilter,
      users: usersInActivityFilter
    },
    validationsFilters: {
      teams: adminedTeams,
      users: usersInValidationFilter
    }
  };
}

export function updateTeamsReducer(state, { teams, employments }) {
  const usersAndTeamsFilters = computeUsersAndTeamFilters(
    state.users,
    employments,
    teams
  );

  return {
    ...state,
    teams: teams,
    employments: employments,
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
