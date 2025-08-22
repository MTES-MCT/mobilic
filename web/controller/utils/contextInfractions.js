import React, { createContext, useContext } from "react";
import { useReportInfractions } from "./useReportInfractions";

const InfractionsContext = createContext(null);

export const useInfractions = () => useContext(InfractionsContext);

export function InfractionsProvider({ controlData, children }) {
  return (
    <InfractionsContext.Provider
      value={{ ...useReportInfractions(controlData) }}
    >
      {children}
    </InfractionsContext.Provider>
  );
}
