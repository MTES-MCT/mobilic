import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import React from "react";
import { GenericRegulatoryAlerts } from "./GenericRegulatoryAlerts";
import { RegulatoryTextWeekBeforeAndAfter } from "./RegulatoryText";

export function WeekRegulatoryAlerts({
  userId,
  day,
  shouldDisplayInitialEmployeeVersion,
  prefetchedRegulationComputation,
  shouldFetchRegulationComputation = true
}) {
  return (
    <GenericRegulatoryAlerts
      userId={userId}
      day={day}
      shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
      shouldFetchRegulationComputation={shouldFetchRegulationComputation}
      prefetchedRegulationComputation={prefetchedRegulationComputation}
      regulationCheckUnit={PERIOD_UNITS.WEEK}
      explanationTextComponent={<RegulatoryTextWeekBeforeAndAfter />}
    />
  );
}
