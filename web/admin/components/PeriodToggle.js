import React from "react";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup/ToggleButtonGroup";
import { useMatomo } from "@datapunt/matomo-tracker-react";

export function PeriodToggle({ period, setPeriod }) {
  const { trackEvent } = useMatomo();
  return (
    <ToggleButtonGroup
      size="small"
      value={period}
      exclusive
      onChange={(e, newPeriod) => {
        if (newPeriod) {
          trackEvent({
            category: "admin-navigation",
            action: "filter-period-activities",
            name: `Activités par "${newPeriod}"`
          });
          setPeriod(newPeriod);
        }
      }}
    >
      <ToggleButton value="day">Jour</ToggleButton>
      <ToggleButton value="week">Semaine</ToggleButton>
      <ToggleButton value="month">Mois</ToggleButton>
    </ToggleButtonGroup>
  );
}
