import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ACTIVITY_FILTER_PERIOD } from "common/utils/matomoTags";

export function PeriodToggle({ period, setPeriod }) {
  const { trackEvent } = useMatomo();
  return (
    <ToggleButtonGroup
      size="small"
      value={period}
      exclusive
      onChange={(e, newPeriod) => {
        if (newPeriod) {
          trackEvent(ACTIVITY_FILTER_PERIOD(newPeriod));
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
