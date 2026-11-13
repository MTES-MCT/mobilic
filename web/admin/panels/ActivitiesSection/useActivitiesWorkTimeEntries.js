import { useState, useCallback, useEffect, useMemo } from "react";
import { aggregateWorkDayPeriods } from "../../utils/workDays";
import { getStartOfDay, isoFormatLocalDate } from "common/utils/time";
import { missionWithStats } from "../../selectors/missionSelectors";
import { useAdminStore } from "../../store/store";
import { useRefreshDeletedMissions } from "../../hooks/useRefreshDeletedMissions";

export const useActivitiesWorkTimeEntries = ({ period, appliedDateRange }) => {
  const adminStore = useAdminStore();
  const { refresh: refreshDeletedMissions } = useRefreshDeletedMissions();

  const { users } = adminStore.activitiesFilters;

  // Deleted missions are fetched lazily, only once the user click to show them from the status filter.
  const [showDeletedMissions, setShowDeletedMissions] = useState(false);
  const handleShowDeletedMissions = useCallback(() => {
    setShowDeletedMissions(true);
  }, []);

  const selectedUsers = useMemo(() => {
    const selected = users.filter((u) => u.selected);
    if (selected.length === 0) {
      return users;
    }
    return selected;
  }, [users]);

  // Refetch deleted missions scoped to the selected period,
  useEffect(() => {
    if (!showDeletedMissions || !adminStore.userId || !adminStore.companyId) {
      return;
    }
    void refreshDeletedMissions(
      appliedDateRange.minDate,
      appliedDateRange.maxDate,
    );
  }, [
    showDeletedMissions,
    appliedDateRange,
    adminStore.userId,
    adminStore.companyId,
    refreshDeletedMissions,
  ]);

  const selectedWorkDays = useMemo(
    () =>
      adminStore.workDays.filter(
        (wd) =>
          selectedUsers.map((u) => u.id).includes(wd.user.id) &&
          (!appliedDateRange.minDate || wd.day >= appliedDateRange.minDate) &&
          (!appliedDateRange.maxDate || wd.day <= appliedDateRange.maxDate),
      ),
    [appliedDateRange, selectedUsers, adminStore.workDays],
  );

  // We create this object to have missions filled with stats easily accessible by id to avoid doing costly computations for each entry in the work time table.
  // This allows us to quickly look up mission details without iterating through the entire list of missions for each work day entry.
  const missionsById = useMemo(() => {
    const missions = missionWithStats(adminStore) || [];

    return missions.reduce((acc, mission) => {
      acc[mission.id] = mission;
      return acc;
    }, {});
  }, [adminStore]);

  const periodAggregates = useMemo(
    () => aggregateWorkDayPeriods(selectedWorkDays, period),
    [selectedWorkDays, period],
  );

  // Deleted missions are excluded from the server-computed workDays, so we build
  // synthetic day-view entries for them. They are hidden by default in the table
  // through the mission status filter ("Mission supprimée").
  const deletedMissionEntries = useMemo(() => {
    if (period !== "day") {
      return [];
    }
    const selectedUserIds = new Set(selectedUsers.map((u) => u.id));
    const entries = [];
    Object.values(missionsById).forEach((mission) => {
      if (!mission.isDeleted || !mission.userStats) {
        return;
      }
      Object.values(mission.userStats).forEach((userStat) => {
        const user = userStat.user;
        if (!user || !selectedUserIds.has(user.id)) {
          return;
        }
        const startTime = userStat.startTime || mission.startTime;
        if (!startTime) {
          return;
        }
        const day = isoFormatLocalDate(new Date(startTime * 1000));
        if (appliedDateRange.minDate && day < appliedDateRange.minDate) {
          return;
        }
        if (appliedDateRange.maxDate && day > appliedDateRange.maxDate) {
          return;
        }
        entries.push({
          user,
          day,
          periodStart: getStartOfDay(startTime),
          startTime,
          lastActivityStartTime: userStat.lastActivityStartTime || startTime,
          missionNames: { [mission.id]: mission.name },
          regulationComputations: null,
        });
      });
    });
    return entries;
  }, [period, missionsById, selectedUsers, appliedDateRange]);

  const workTimeEntries = useMemo(
    () => [...periodAggregates, ...deletedMissionEntries],
    [periodAggregates, deletedMissionEntries],
  );

  return { missionsById, workTimeEntries, handleShowDeletedMissions };
};
