import React from "react";
import {
  splitByLongBreaksAndComputePeriodStats,
  renderPeriodKpis,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { PeriodHeader } from "./PeriodHeader";

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
    ).filter(kpi => kpi.name !== "service");
    if (hasWorkMissions) {
      return allKpis;
    }
    return allKpis.filter(kpi => kpi.name === "offDays");
  }, [
    hasWorkMissions,
    activitiesWithNextAndPreviousDay,
    selectedPeriodStart,
    selectedPeriodEnd,
    missionsInPeriod
  ]);

  return (
    <PeriodHeader>
      <WorkTimeSummaryKpiGrid metrics={kpis} />
    </PeriodHeader>
  );
}
