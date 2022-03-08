import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export function PeriodToggle({ period, setPeriod }) {
  return (
    <ToggleButtonGroup
      size="small"
      value={period}
      exclusive
      onChange={(e, newPeriod) => {
        if (newPeriod) setPeriod(newPeriod);
      }}
    >
      <ToggleButton value="day">Jour</ToggleButton>
      <ToggleButton value="week">Semaine</ToggleButton>
      <ToggleButton value="month">Mois</ToggleButton>
    </ToggleButtonGroup>
  );
}
