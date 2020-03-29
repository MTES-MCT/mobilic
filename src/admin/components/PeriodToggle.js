import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";

export function PeriodToggle({ period, setPeriod }) {
  return (
    <ToggleButtonGroup
      value={period}
      exclusive
      onChange={(e, newPeriod) => setPeriod(newPeriod)}
    >
      <ToggleButton value="day">Jour</ToggleButton>
      <ToggleButton value="week">Semaine</ToggleButton>
      <ToggleButton value="month">Mois</ToggleButton>
    </ToggleButtonGroup>
  );
}
