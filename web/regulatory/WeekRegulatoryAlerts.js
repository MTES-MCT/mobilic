import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";
import React from "react";
import { renderRegulationCheck } from "./RegulatoryAlertRender";
import {
  RegulatoryTextNotCalculatedYet,
  RegulatoryTextWeekBeforeAndAfter
} from "./RegulatoryText";

export function WeekRegulatoryAlerts({ regulationComputation }) {
  console.log(regulationComputation);
  return regulationComputation ? (
    <>
      <RegulatoryTextWeekBeforeAndAfter />
      {regulationComputation.regulationChecks
        ?.filter(regulationCheck => regulationCheck.unit === PERIOD_UNITS.WEEK)
        .map(regulationCheck => renderRegulationCheck(regulationCheck))}
    </>
  ) : (
    <RegulatoryTextNotCalculatedYet />
  );
}
