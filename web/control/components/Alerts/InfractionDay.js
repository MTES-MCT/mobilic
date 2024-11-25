import React from "react";

export const InfractionDay = ({
  alert,
  days,
  isReportingInfractions,
  onUpdateInfraction
}) => {
  return <pre>{JSON.stringify(days, null, 2)}</pre>;
};
