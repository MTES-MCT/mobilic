import React from "react";
import { History } from "../../pwa/screens/History";

export function UserReadHistory({
  missions,
  coworkers,
  vehicles,
  userInfo,
  controlTime,
  tokenInfo,
  periodOnFocus,
  controlId,
  regulationComputationsByDay,
  controlData,
  groupedAlerts
}) {
  return (
    <History
      key={1}
      missions={missions}
      isInControl={true}
      controlTime={controlTime}
      historyStartDay={tokenInfo.historyStartDay}
      coworkers={coworkers}
      vehicles={vehicles}
      userId={userInfo?.id || controlData?.user.id}
      openPeriod={periodOnFocus}
      controlId={controlId}
      regulationComputationsByDay={regulationComputationsByDay}
      groupedAlerts={groupedAlerts}
    />
  );
}
