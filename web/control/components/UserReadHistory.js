import React from "react";
import { History } from "../../pwa/screens/History";
import { useControl } from "../../controller/utils/contextControl";

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
  groupedAlerts
}) {
  const { controlData } = useControl() ?? {};
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
