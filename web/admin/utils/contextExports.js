import React, { createContext, useContext } from "react";
import { useExports as useExportsHook } from "../hooks/useExports";

const ExportsContext = createContext(null);

export const useExportsContext = () => useContext(ExportsContext);

export function ExportsProvider({ children }) {
  return (
    <ExportsContext.Provider value={{ ...useExportsHook() }}>
      {children}
    </ExportsContext.Provider>
  );
}
