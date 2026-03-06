import React, { createContext, useContext, useMemo } from "react";
import { useExports as useExportsHook } from "../hooks/useExports";

const ExportsContext = createContext(null);

export const useExportsContext = () => useContext(ExportsContext);

export function ExportsProvider({ children }) {
  const exportsHookValue = useExportsHook();
  const memoizedValue = useMemo(
    () => ({
      nbExports: exportsHookValue.nbExports,
      updateExports: exportsHookValue.updateExports,
      addExport: exportsHookValue.addExport,
      cancelExports: exportsHookValue.cancelExports
    }),
    [
      exportsHookValue.nbExports,
      exportsHookValue.updateExports,
      exportsHookValue.addExport,
      exportsHookValue.cancelExports
    ]
  );

  return (
    <ExportsContext.Provider value={memoizedValue}>
      {children}
    </ExportsContext.Provider>
  );
}
