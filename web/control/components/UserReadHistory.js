import React from "react";
import { History } from "../../pwa/screens/History";
import { DAY, getStartOfMonth, now } from "common/utils/time";

export function UserReadHistory({
  missions,
  coworkers,
  vehicles,
  userInfo,
  periodOnFocus
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
    />
  );
}
