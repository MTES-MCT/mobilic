import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import React from "react";
import { GenericRegulatoryAlerts } from "./GenericRegulatoryAlerts";
import { RegulatoryTextDayBeforeAndAfter } from "./RegulatoryText";

export function DayRegulatoryAlerts({
  userId,
  day,
  prefetchedRegulationComputation,
  shouldDisplayInitialEmployeeVersion = false,
  shouldFetchRegulationComputation = true
}) {
  return (
    <GenericRegulatoryAlerts
      userId={userId}
      day={day}
      shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
      shouldFetchRegulationComputation={shouldFetchRegulationComputation}
      prefetchedRegulationComputation={prefetchedRegulationComputation}
      regulationCheckUnit={PERIOD_UNITS.DAY}
      explanationTextComponent={<RegulatoryTextDayBeforeAndAfter />}
    />
  );
}
