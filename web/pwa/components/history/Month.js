import React from "react";
import {
  splitByLongBreaksAndComputePeriodStats,
  renderPeriodKpis,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";

export function Month({
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd,
  missionsInPeriod
}) {
  const hasWorkMissions = React.useMemo(
    () => missionsInPeriod.filter(mission => !mission.isHoliday).length > 0,
    [missionsInPeriod]
  );
  const kpis = React.useMemo(() => {
    let allKpis = renderPeriodKpis(
      splitByLongBreaksAndComputePeriodStats(
        activitiesWithNextAndPreviousDay,
        selectedPeriodStart,
        selectedPeriodEnd,
        missionsInPeriod
      )
    ).filter(m => m.name !== "service");
    if (hasWorkMissions) {
      return allKpis;
    }
    return allKpis.filter(m => m.name === "offDays");
  }, [
    hasWorkMissions,
    activitiesWithNextAndPreviousDay,
    selectedPeriodStart,
    selectedPeriodEnd,
    missionsInPeriod
  ]);

  return (
    <div>
      <WorkTimeSummaryKpiGrid metrics={kpis} />
    </div>
  );
}
