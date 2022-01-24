import { createSelector } from "reselect";
import { computeMissionStats } from "common/utils/mission";
import values from "lodash/values";

export const missionsSelector = state => state.missions;
const usersSelector = state => state.users;

export const missionWithStats = createSelector(
  missionsSelector,
  usersSelector,
  (missions, users) =>
    missions?.map(mission => computeMissionStats(mission, users))
);

export const missionHasActivities = missionWithStat =>
  missionWithStat.activities.length > 0;

export const missionValidatedByAdmin = missionWithStat =>
  missionWithStat.adminGlobalValidation ||
  missionWithStat.validatedByAdminForAllMembers;

export const missionHasAtLeastOneWorkerValidationAndNotAdmin = missionWithStat =>
  values(missionWithStat.userStats).some(
    us => us.workerValidation && !us.adminValidation
  );
