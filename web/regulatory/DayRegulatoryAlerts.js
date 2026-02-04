import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import React from "react";
import { GenericRegulatoryAlerts } from "./GenericRegulatoryAlerts";

export function DayRegulatoryAlerts({
  userId,
  day,
  shouldDisplayInitialEmployeeVersion = false,
}) {
  return (
    <GenericRegulatoryAlerts
      userId={userId}
      day={day}
      shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
      regulationCheckUnit={PERIOD_UNITS.DAY}
      employeeView={true}
    />
  );
}
