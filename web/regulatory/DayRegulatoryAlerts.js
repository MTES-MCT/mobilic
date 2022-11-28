import React from "react";
import { renderRegulationCheck } from "./RegulatoryAlertRender";
import {
  RegulatoryTextDayBeforeAndAfter,
  RegulatoryTextNotCalculatedYet
} from "./RegulatoryText";

export function DayRegulatoryAlerts({ regulationComputation }) {
  return regulationComputation ? (
    <>
      <RegulatoryTextDayBeforeAndAfter />
      {regulationComputation.regulationChecks
        ?.filter(regulationCheck => regulationCheck.unit === "day")
        .map(regulationCheck => renderRegulationCheck(regulationCheck))}
    </>
  ) : (
    <RegulatoryTextNotCalculatedYet />
  );
}
