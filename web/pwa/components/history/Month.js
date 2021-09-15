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
  return (
    <div>
      <WorkTimeSummaryKpiGrid
        metrics={renderPeriodKpis(
          splitByLongBreaksAndComputePeriodStats(
            activitiesWithNextAndPreviousDay,
            selectedPeriodStart,
            selectedPeriodEnd,
            missionsInPeriod
          )
        ).filter(m => m.name !== "service")}
      />
    </div>
  );
}
