import { createSelector } from "reselect";
import { DAY, now } from "common/utils/time";
import { computeMissionStats } from "common/utils/mission";

const DEFAULT_WORKER_VALIDATION_TIMEOUT = 10 * DAY;

const missionsSelector = state => state.missions;
const usersSelector = state => state.users;

const missionNotValidatedByAdmin = missionWithStat =>
  !missionWithStat.adminValidation &&
  !missionWithStat.validatedAdminByAllMembers &&
  missionWithStat.activities.length > 0;

const missionValidatedByAdmin = missionWithStat =>
  (missionWithStat.adminValidation ||
    missionWithStat.validatedAdminByAllMembers) &&
  missionWithStat.activities.length > 0;

const missionsValidatedByAllWorkersOrOld = missionWithStat =>
  missionWithStat.validatedByAllMembers ||
  missionWithStat.startTime + DEFAULT_WORKER_VALIDATION_TIMEOUT < now();

const missionsNotValidatedByAllWorkers = missionWithStats =>
  !missionWithStats.validatedByAllMembers &&
  missionWithStats.startTime + DEFAULT_WORKER_VALIDATION_TIMEOUT >= now();

export const missionWithStats = createSelector(
  missionsSelector,
  usersSelector,
  (missions, users) =>
    missions?.map(mission => computeMissionStats(mission, users))
);

export const missionsToValidateByAdmin = createSelector(
  missionWithStats,
  missions =>
    missions
      ?.filter(missionNotValidatedByAdmin)
      .filter(missionsValidatedByAllWorkersOrOld)
);

export const missionsValidatedByAdmin = createSelector(
  missionWithStats,
  missions => missions?.filter(missionValidatedByAdmin)
);

export const missionsToValidateByWorkers = createSelector(
  missionWithStats,
  missions =>
    missions
      ?.filter(missionNotValidatedByAdmin)
      .filter(missionsNotValidatedByAllWorkers)
);
