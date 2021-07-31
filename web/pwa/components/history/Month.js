import React from "react";
import {
  splitByLongBreaksAndComputePeriodStats,
  renderPeriodKpis,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";

export function Month({
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd
}) {
  return (
    <div>
      <WorkTimeSummaryKpiGrid
        metrics={renderPeriodKpis(
          splitByLongBreaksAndComputePeriodStats(
            activitiesWithNextAndPreviousDay,
            selectedPeriodStart,
            selectedPeriodEnd
          )
        ).filter(m => m.name !== "service")}
      />
    </div>
  );
}
