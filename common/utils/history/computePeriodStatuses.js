import React from "react";
import mapValues from "lodash/mapValues";

export const PERIOD_STATUSES = {
  notValidated: "notValidated",
  notValidatedByAdmin: "notValidatedByAdmin",
  fullyValidated: "fullyValidated"
};

export function useComputePeriodStatuses(missionGroupsByPeriodUnit) {
  const [periodStatuses, setPeriodStatuses] = React.useState({});

  React.useEffect(() => {
    setPeriodStatuses(
      mapValues(missionGroupsByPeriodUnit, missionGroups =>
        mapValues(missionGroups, ms => {
          if (ms.some(m => !m.isDeleted && !m.validation && !m.adminValidation))
            return PERIOD_STATUSES.notValidated;
          if (ms.some(m => !m.isDeleted && !m.adminValidation))
            return PERIOD_STATUSES.notValidatedByAdmin;
          return PERIOD_STATUSES.fullyValidated;
        })
      )
    );
  }, [missionGroupsByPeriodUnit]);

  return periodStatuses;
}
