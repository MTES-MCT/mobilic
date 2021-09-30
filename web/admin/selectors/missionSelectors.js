import { createSelector } from "reselect";
import { DAY, now } from "common/utils/time";
import { computeMissionStats } from "common/utils/mission";

const DEFAULT_WORKER_VALIDATION_TIMEOUT = 7 * DAY;

const missionsSelector = state => state.missions;
const usersSelector = state => state.users;

const missionNotValidatedByAdmin = missionWithStat =>
  !missionWithStat.adminValidation && missionWithStat.activities.length > 0;

const missionsValidatedByAllWorkers = missionWithStat =>
  missionWithStat.validatedByAllMembers ||
  missionWithStat.endTime + DEFAULT_WORKER_VALIDATION_TIMEOUT < now();

const missionsNotValidatedByAllWorkers = missionWithStats =>
  !missionWithStats.validatedByAllMembers &&
  missionWithStats.endTime + DEFAULT_WORKER_VALIDATION_TIMEOUT >= now();

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
      .filter(missionsValidatedByAllWorkers)
);

export const missionsToValidateByWorkers = createSelector(
  missionWithStats,
  missions =>
    missions
      ?.filter(missionNotValidatedByAdmin)
      .filter(missionsNotValidatedByAllWorkers)
);
