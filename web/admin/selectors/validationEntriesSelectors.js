import { createSelector } from "reselect";
import { getStartOfDay, now } from "common/utils/time";
import flatMap from "lodash/flatMap";
import map from "lodash/map";
import { missionWithStats } from "./missionSelectors";

export const missionsToTableEntries = createSelector(
  missionWithStats,
  missions => {
    const now1 = now();
    return flatMap(
      missions?.map(m =>
        map(m.userStats, us => ({
          ...us,
          missionTooOld: m.missionTooOld,
          missionNotUpdatedForTooLong: m.missionNotUpdatedForTooLong,
          name: m.name,
          missionStartTime: m.startTime,
          missionId: m.id,
          companyId: m.companyId,
          id: `${m.id}${us.user.id}`,
          multipleDays:
            getStartOfDay(m.startTime) !==
            getStartOfDay(m.endTime ? m.endTime - 1 : now1)
        }))
      )
    );
  }
);

export const entryToBeValidatedByAdmin = tableEntry =>
  !tableEntry.adminValidation &&
  (tableEntry.workerValidation ||
    tableEntry.missionTooOld ||
    tableEntry.missionNotUpdatedForTooLong);

export const entryToBeValidatedByWorker = tableEntry =>
  !tableEntry.adminValidation && !tableEntry.workerValidation;
