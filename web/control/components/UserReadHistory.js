import React from "react";
import { History } from "../../pwa/screens/History";

export function UserReadHistory({
  missions,
  coworkers,
  vehicles,
  userInfo,
  periodOnFocus,
  controlId,
  controlTime,
  regulationComputationsByDay
}) {
  return (
    <History
      key={1}
      missions={missions}
      isInControl={true}
      controlTime={controlTime}
      coworkers={coworkers}
      vehicles={vehicles}
      userId={userInfo.id}
      openPeriod={periodOnFocus}
      controlId={controlId}
      regulationComputationsByDay={regulationComputationsByDay}
    />
  );
}
