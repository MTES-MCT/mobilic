import React, { createContext, useContext } from "react";
import { useReadControlData } from "./useReadControlData";

const ControlContext = createContext(null);

export const useControl = () => useContext(ControlContext);

export function ControlProvider({ controlId, controlType, children }) {
  return (
    <ControlContext.Provider
      value={{ ...useReadControlData(controlId, controlType) }}
    >
      {children}
    </ControlContext.Provider>
  );
}
