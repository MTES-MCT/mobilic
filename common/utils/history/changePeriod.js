import React from "react";
import { fillHistoryPeriods } from "./fillPeriods";
import find from "lodash/find";
import mapValues from "lodash/mapValues";
import toPairs from "lodash/toPairs";
import { findMatchingPeriodInNewUnit } from "./groupByPeriodUnit";
import { PERIOD_UNITS } from "./periodUnits";
import { now } from "../time";

function getPeriodListFromMissionGroups(missionGroupsByPeriodUnit, periodUnit) {
  return fillHistoryPeriods(
    Object.keys(missionGroupsByPeriodUnit[periodUnit])
      .map(p => parseInt(p))
      .sort(),
    periodUnit
  );
}

export function useSelectPeriod(missionGroupsByPeriodUnit, initialPeriodUnit) {
  const [periodsByPeriodUnit, setPeriodsByPeriodUnit] = React.useState({});
  const [oldPeriodUnit, setOldPeriodUnit] = React.useState(initialPeriodUnit);

  const [missionId, setMissionId] = React.useState(null);
  const [pendingPeriodUnit, setPendingPeriodUnit] = React.useState(null);
  const [pendingDate, setPendingDate] = React.useState(null);

  const [selectedPeriod, setSelectedPeriod] = React.useState(null);

  function updateStateWithNewPeriod(newPeriod, newPeriodUnit) {
    setSelectedPeriod(newPeriod);
    setOldPeriodUnit(newPeriodUnit);
    if (newPeriodUnit === "mission") {
      setMissionId(
        missionGroupsByPeriodUnit[newPeriodUnit][newPeriod.toString()][0].id
      );
    } else setMissionId(null);
    setPendingPeriodUnit(null);
    setPendingDate(null);
  }

  function goToPeriod(newPeriodUnit, period) {
    const periods = periodsByPeriodUnit[newPeriodUnit];
    if (periods) {
      const newPeriod = findMatchingPeriodInNewUnit(
        period,
        periods,
        PERIOD_UNITS[oldPeriodUnit].periodLength,
        PERIOD_UNITS[newPeriodUnit].periodLength
      );
      updateStateWithNewPeriod(newPeriod, newPeriodUnit);
    } else {
      setPendingPeriodUnit(newPeriodUnit);
      setPendingDate(period);
    }
  }

  function goToMission(missionId_) {
    if (missionGroupsByPeriodUnit["mission"]) {
      const missionsAsLists = missionGroupsByPeriodUnit["mission"];
      const missionsAsListsAsTuples = toPairs(missionsAsLists);
      const newPeriod = (find(
        missionsAsListsAsTuples,
        ms => ms[1][0].id === missionId_
      ) || missionsAsListsAsTuples[missionsAsListsAsTuples.length - 1])[0];
      updateStateWithNewPeriod(parseInt(newPeriod), "mission");
    } else setMissionId(missionId_);
  }

  React.useEffect(() => {
    setPeriodsByPeriodUnit(
      mapValues(missionGroupsByPeriodUnit, (_, periodUnit) =>
        getPeriodListFromMissionGroups(missionGroupsByPeriodUnit, periodUnit)
      )
    );
  }, [missionGroupsByPeriodUnit]);

  React.useEffect(() => {
    if (periodsByPeriodUnit[oldPeriodUnit]) {
      if (missionId) goToMission(missionId);
      else if (pendingPeriodUnit) goToPeriod(pendingPeriodUnit, pendingDate);
      else goToPeriod(oldPeriodUnit, selectedPeriod || now());
    }
  }, [periodsByPeriodUnit]);

  return [selectedPeriod, goToPeriod, goToMission, periodsByPeriodUnit];
}
