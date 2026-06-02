import React from "react";
import { unixToJSTimestamp } from "../time";

// Custom hook to normalize control/token data into a standard tokenInfo format
export function useTokenInfo({ tokenInfo, controlTime, controlData }) {
  return React.useMemo(() => {
    // Controller view: transform controlData into tokenInfo format
    if (controlData) {
      const timeValue = controlData.controlTime || controlData.qrCodeGenerationTime;
      if (!timeValue) {
        return {
          creationDay: new Date().toISOString().split('T')[0],
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
            historyStartDay = historyDate.toISOString().split('T')[0];
          }
        } catch (err) {
          console.error('[useTokenInfo] Error parsing historyStartDate', err);
        }
      }
      
      return {
        creationDay: controlDate.toISOString().split('T')[0],
        historyStartDay: historyStartDay,
        creationTime: controlData.creationTime,
        controlTime: controlData.controlTime
      };
    }
    
    // Employee view: use existing tokenInfo, override if controlTime is updated
    if (!tokenInfo) return null;
    
    if (controlTime) {
      const controlDate = new Date(unixToJSTimestamp(controlTime));
      const HISTORY_DEPTH_DAYS = parseInt(process.env.REACT_APP_USER_CONTROL_HISTORY_DEPTH || "28");
      const historyStartDate = new Date(controlDate);
      historyStartDate.setDate(historyStartDate.getDate() - HISTORY_DEPTH_DAYS);
      
      return {
        ...tokenInfo,
        creationDay: controlDate.toISOString().split('T')[0],
        historyStartDay: historyStartDate.toISOString().split('T')[0]
      };
    }
    
    return tokenInfo;
  }, [tokenInfo, controlTime, controlData]);
}
