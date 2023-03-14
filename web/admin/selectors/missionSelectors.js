import { createSelector } from "reselect";
import { computeMissionStats } from "common/utils/mission";
import values from "lodash/values";

export const missionsSelector = state => state.missions;

const usersSelector = state => {
  const selectedUsers = state.validationsFilters?.users.filter(
    u => !!u.selected
  );
  if (selectedUsers?.length > 0) {
    return selectedUsers;
  } else {
    return state.validationsFilters?.users;
  }
};

export const missionWithStats = createSelector(
  missionsSelector,
  usersSelector,
  (missions, users) =>
    missions?.map(mission => computeMissionStats(mission, users))
);

export const missionHasAtLeastOneAdminValidation = missionWithStat =>
  values(missionWithStat?.userStats).some(us => us.adminValidation);
