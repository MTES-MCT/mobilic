import React, { createContext, useContext, useMemo } from "react";
import { useReportInfractions } from "./useReportInfractions";

const InfractionsContext = createContext(null);

export const useInfractions = () => useContext(InfractionsContext);

export function InfractionsProvider({ controlData, children }) {
  const infractionsHookValue = useReportInfractions(controlData);
  const memoizedValue = useMemo(
    () => ({
      groupedAlerts: infractionsHookValue.groupedAlerts,
      isReportingInfractions: infractionsHookValue.isReportingInfractions,
      totalAlertsNumber: infractionsHookValue.totalAlertsNumber,
      reportedInfractionsLastUpdateTime:
        infractionsHookValue.reportedInfractionsLastUpdateTime,
      saveInfractions: infractionsHookValue.saveInfractions,
      cancelInfractions: infractionsHookValue.cancelInfractions,
      setIsReportingInfractions: infractionsHookValue.setIsReportingInfractions,
      onUpdateInfraction: infractionsHookValue.onUpdateInfraction,
      onAddInfraction: infractionsHookValue.onAddInfraction,
      onRemoveInfraction: infractionsHookValue.onRemoveInfraction
    }),
    [
      infractionsHookValue.groupedAlerts,
      infractionsHookValue.isReportingInfractions,
      infractionsHookValue.totalAlertsNumber,
      infractionsHookValue.reportedInfractionsLastUpdateTime,
      infractionsHookValue.saveInfractions,
      infractionsHookValue.cancelInfractions,
      infractionsHookValue.setIsReportingInfractions,
      infractionsHookValue.onUpdateInfraction,
      infractionsHookValue.onAddInfraction,
      infractionsHookValue.onRemoveInfraction
    ]
  );

  return (
    <InfractionsContext.Provider value={memoizedValue}>
      {children}
    </InfractionsContext.Provider>
  );
}
