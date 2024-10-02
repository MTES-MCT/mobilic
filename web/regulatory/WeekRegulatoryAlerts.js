import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import React from "react";
import { GenericRegulatoryAlerts } from "./GenericRegulatoryAlerts";

export function WeekRegulatoryAlerts({
  userId,
  day,
  shouldDisplayInitialEmployeeVersion
}) {
  return (
    <GenericRegulatoryAlerts
      userId={userId}
      day={day}
      shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
      regulationCheckUnit={PERIOD_UNITS.WEEK}
    />
  );
}
