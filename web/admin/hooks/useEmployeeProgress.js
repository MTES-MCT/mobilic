import React from "react";

function calculateProgressData(declaredNbWorkers, registeredEmployees) {
  if (declaredNbWorkers <= 0) {
    return null;
  }

  const percentage = Math.min(
    (registeredEmployees / declaredNbWorkers) * 100,
    100
  );

  let color;
  if (percentage === 100) {
    color = "info";
  } else if (percentage >= 75) {
    color = "success";
  } else if (percentage >= 25) {
    color = "warning";
  } else {
    color = "error";
  }

  const shouldShowSingleInviteButton = percentage < 75;
  const shouldShowBadge = registeredEmployees < declaredNbWorkers;

  return {
    percentage: Math.round(percentage),
    registeredEmployees,
    declaredNbWorkers,
    color,
    shouldShowBadge,
    shouldShowSingleInviteButton
  };
}

export function useEmployeeProgress(company, validEmployments) {
  const progressData = React.useMemo(() => {
    const declaredNbWorkers = company?.nbWorkers || 0;
    const registeredEmployees = validEmployments.length;
    return calculateProgressData(declaredNbWorkers, registeredEmployees);
  }, [company?.nbWorkers, validEmployments.length]);

  return progressData;
}
