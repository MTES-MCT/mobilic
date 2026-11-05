import React from "react";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { ACTIVITY_FILTER_PERIOD } from "common/utils/matomoTags";

export function PeriodToggle({ period, setPeriod }) {
  const { trackEvent } = useMatomo();

  const handleChange = (newPeriod) => {
    trackEvent(ACTIVITY_FILTER_PERIOD(newPeriod));
    setPeriod(newPeriod);
  };

  return (
    <SegmentedControl
      hideLegend
      legend="Période"
      small
      segments={[
        {
          label: "Jour",
          nativeInputProps: {
            checked: period === "day",
            onChange: () => handleChange("day")
          }
        },
        {
          label: "Semaine",
          nativeInputProps: {
            checked: period === "week",
            onChange: () => handleChange("week")
          }
        },
        {
          label: "Mois",
          nativeInputProps: {
            checked: period === "month",
            onChange: () => handleChange("month")
          }
        }
      ]}
    />
  );
}
