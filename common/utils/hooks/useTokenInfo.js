import React from "react";
import { unixToJSTimestamp, CONTROL_HISTORY_DEPTH, isoFormatLocalDate } from "../time";

// Custom hook to normalize control/token data into a standard tokenInfo format
export function useTokenInfo({ tokenInfo, controlTime, controlData }) {
  return React.useMemo(() => {
    // Controller view: transform controlData into tokenInfo format
    if (controlData) {
      const timeValue = controlData.controlTime || controlData.qrCodeGenerationTime;
      if (!timeValue) {
        return {
          creationDay: isoFormatLocalDate(new Date()),
          historyStartDay: null,
          creationTime: null,
          controlTime: null
        };
      }
      
      const controlDate = new Date(unixToJSTimestamp(timeValue));
      
      let historyStartDay = null;
      if (controlData.historyStartDate) {
        try {
          const historyDate = new Date(controlData.historyStartDate);
          
          if (!isNaN(historyDate.getTime())) {
            historyStartDay = isoFormatLocalDate(historyDate);
          }
        } catch (err) {
          console.error('[useTokenInfo] Error parsing historyStartDate', err);
        }
      }
      
      return {
        creationDay: isoFormatLocalDate(controlDate),
        historyStartDay: historyStartDay,
        creationTime: controlData.creationTime,
        controlTime: controlData.controlTime
      };
    }
    
    // Employee view: use existing tokenInfo, override if controlTime is updated
    if (!tokenInfo) return null;
    
    if (controlTime) {
      const controlDate = new Date(unixToJSTimestamp(controlTime));
      const historyStartDate = new Date(controlDate);
      historyStartDate.setDate(historyStartDate.getDate() - CONTROL_HISTORY_DEPTH);
      
      return {
        ...tokenInfo,
        creationDay: isoFormatLocalDate(controlDate),
        historyStartDay: isoFormatLocalDate(historyStartDate)
      };
    }
    
    return tokenInfo;
  }, [tokenInfo, controlTime, controlData]);
}
