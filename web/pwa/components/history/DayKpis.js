import {
  renderPeriodKpis,
  splitByLongBreaksAndComputePeriodStats,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import React from "react";
import { DAY } from "common/utils/time";

export function DayKpis({
  activitiesWithNextAndPreviousDay,
  dayStart,
  loading = false,
  missions
}) {
  const dayEnd = dayStart + DAY;

  const stats = splitByLongBreaksAndComputePeriodStats(
    activitiesWithNextAndPreviousDay,
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
          metrics={renderPeriodKpis(stats, true)
            .filter(kpi => kpi.name !== "workedDays")
            .filter(kpi => kpi.name !== "offDays")}
        />
      </>
    )
  );
}
