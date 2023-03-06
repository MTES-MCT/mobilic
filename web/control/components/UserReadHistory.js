import React from "react";
import { History } from "../../pwa/screens/History";

export function UserReadHistory({
  missions,
  coworkers,
  vehicles,
  userInfo,
  periodOnFocus,
  controlId,
  regulationComputationsByDay
}) {
  return (
    <History
      key={1}
      missions={missions}
      displayActions={false}
      coworkers={coworkers}
      vehicles={vehicles}
      userId={userInfo.id}
      openPeriod={periodOnFocus}
      controlId={controlId}
      regulationComputationsByDay={regulationComputationsByDay}
    />
  );
}
