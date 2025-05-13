import {
  renderPeriodKpis,
  splitByLongBreaksAndComputePeriodStats,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import React from "react";
import { DAY } from "common/utils/time";

export function DayKpis({
  adminActivitiesWithNextAndPreviousDay,
  employeeActivitiesWithNextAndPreviousDay,
  displayEmployee,
  dayStart,
  loading = false,
  missions
}) {
  const dayEnd = dayStart + DAY;

  const adminStats =
    adminActivitiesWithNextAndPreviousDay &&
    splitByLongBreaksAndComputePeriodStats(
      adminActivitiesWithNextAndPreviousDay,
      dayStart,
      dayEnd
    );

  const employeeStats =
    employeeActivitiesWithNextAndPreviousDay &&
    splitByLongBreaksAndComputePeriodStats(
      employeeActivitiesWithNextAndPreviousDay,
      dayStart,
      dayEnd
    );

  const hasWorkMissions = React.useMemo(
    () => missions.filter(mission => !mission.isHoliday).length > 0,
    [missions]
  );

  return (
    hasWorkMissions && (
      <>
        <WorkTimeSummaryKpiGrid
          loading={loading}
          metrics={renderPeriodKpis(
            adminStats,
            employeeStats,
            displayEmployee,
            true
          )
            .filter(kpi => kpi.name !== "workedDays")
            .filter(kpi => kpi.name !== "offDays")}
        />
      </>
    )
  );
}
