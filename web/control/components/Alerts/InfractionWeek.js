import React from "react";

export const InfractionWeek = ({
  alert,
  weeks,
  isReportingInfractions,
  onUpdateInfraction
}) => {
  return <pre>{JSON.stringify(weeks, null, 2)}</pre>;
};
