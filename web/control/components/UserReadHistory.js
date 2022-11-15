import React from "react";
import { History } from "../../pwa/screens/History";
import { DAY, getStartOfMonth, now } from "common/utils/time";
import _ from "lodash";

export function UserReadHistory({
  missions,
  coworkers,
  vehicles,
  userInfo,
  periodOnFocus,
  controlId,
  regulationComputations
}) {
  return (
    <History
      key={1}
      missions={missions.filter(
        m => m.startTime >= getStartOfMonth(now() - 183 * DAY)
      )}
      displayActions={false}
      coworkers={coworkers}
      vehicles={vehicles}
      userId={userInfo.id}
      openPeriod={periodOnFocus}
      controlId={controlId}
      regulationComputationsPerPeriod={_.groupBy(regulationComputations, "day")}
    />
  );
}
