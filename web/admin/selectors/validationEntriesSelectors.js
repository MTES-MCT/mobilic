import { createSelector } from "reselect";
import { getStartOfDay, now } from "common/utils/time";
import flatMap from "lodash/flatMap";
import map from "lodash/map";
import { missionWithStats } from "./missionSelectors";

export const missionsToTableEntries = createSelector(
  missionWithStats,
  missions => {
    return flatMap(missions?.map(m => missionToValidationEntries(m)));
  }
);

export const missionToValidationEntries = mission =>
  map(mission.userStats, us => ({
    ...us,
    missionTooOld: mission.missionTooOld,
    missionNotUpdatedForTooLong: mission.missionNotUpdatedForTooLong,
    name: mission.name,
    missionStartTime: mission.startTime,
    missionId: mission.id,
    companyId: mission.companyId,
    id: `${mission.id}${us.user.id}`,
    multipleDays:
      getStartOfDay(mission.startTime) !==
      getStartOfDay(mission.endTime ? mission.endTime - 1 : now()),
    isDeleted: mission.isDeleted,
    deletedAt: mission.deletedAt,
    deletedBy: mission.deletedBy,
    isHoliday: mission.isHoliday
  }));

export const entryToBeValidatedByAdmin = (
  tableEntry,
  currentUserId,
  adminCanBypass = false,
  overrideValidationJustification = ""
) => {
  if (tableEntry.isDeleted) {
    return false;
  }

  if (tableEntry.adminManualValidation) {
    return false;
  }

  if (tableEntry.adminAutoValidation) {
    return !!overrideValidationJustification;
  }

  return (
    entryValidatedByWorkerOrOutdated(tableEntry) ||
    tableEntry.lastActivitySubmitterId === currentUserId ||
    adminCanBypass ||
    tableEntry.activities?.length === 0
  );
};

export const entryToBeValidatedByWorker = tableEntry =>
  !tableEntry.adminValidation && !tableEntry.workerValidation;

const entryValidatedByWorkerOrOutdated = tableEntry =>
  tableEntry.workerValidation ||
  tableEntry.missionTooOld ||
  tableEntry.missionNotUpdatedForTooLong;

export const entryDeleted = tableEntry => tableEntry.isDeleted;
