import React from "react";
import { analyzeWorkingDays } from "../workingDaysAnalysis";
import { unixToJSTimestamp } from "../time";

// Custom hook to analyze working days from missions
// Detects days added "a posteriori" and days that were modified
export function useWorkingDaysAnalysis(missions, controlTime, tokenInfo) {
  return React.useMemo(() => {
    if (!missions || missions.length === 0) {
      return {
        workingDaysNumber: 0,
        daysAddedPosterioriNumber: 0,
        daysModifiedNumber: 0
      };
    }

    // Determine reference date for analysis
    const referenceDate = controlTime
      ? new Date(unixToJSTimestamp(controlTime))
      : new Date(tokenInfo?.creationDay);

    const analysis = analyzeWorkingDays(missions, referenceDate);

    return {
      workingDaysNumber: analysis.workingDaysNumber,
      daysAddedPosterioriNumber: analysis.daysAddedPosterioriNumber,
      daysModifiedNumber: analysis.daysModifiedNumber
    };
  }, [missions, controlTime, tokenInfo?.creationDay]);
}
