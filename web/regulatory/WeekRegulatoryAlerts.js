import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import React from "react";
import { GenericRegulatoryAlerts } from "./GenericRegulatoryAlerts";

export function WeekRegulatoryAlerts({
  userId,
  day,
  shouldDisplayInitialEmployeeVersion,
  prefetchedRegulationComputation
}) {
  return (
    <GenericRegulatoryAlerts
      userId={userId}
      day={day}
      shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
      prefetchedRegulationComputation={prefetchedRegulationComputation}
      regulationCheckUnit={PERIOD_UNITS.WEEK}
    />
  );
}
