import React, { useMemo } from "react";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import {
  startOfDay,
  textualPrettyFormatWeek,
  unixToJSTimestamp
} from "common/utils/time";
import { useInfractions } from "../../../controller/utils/contextInfractions";
import { useControl } from "../../../controller/utils/contextControl";

const getLastFourMondays = fromDate => {
  const mondays = [];
  let date = new Date(fromDate);

  while (mondays.length < 4) {
    if (date.getDay() === 1) {
      mondays.push(new Date(date));
    }
    date.setDate(date.getDate() - 1);
  }
  return mondays.map(startOfDay);
};

export const InfractionWeek = ({ alerts, sanction }) => {
  const {
    isReportingInfractions,
    onAddInfraction,
    onRemoveInfraction
  } = useInfractions();
  const { controlData } = useControl();
  const initialWeeks = useMemo(
    () => alerts.map(alert => alert.week).filter(x => !!x),
    [alerts]
  );

  const toggleInfraction = (date, checked) => {
    if (checked) {
      onAddInfraction(sanction, date);
    } else {
      onRemoveInfraction(sanction, date);
    }
  };
  return (
    <Checkbox
      disabled={!isReportingInfractions}
      legend={
        isReportingInfractions
          ? "Sélectionnez la ou les semaines concernées :"
          : ""
      }
      options={getLastFourMondays(
        new Date(unixToJSTimestamp(controlData.creationTime))
      )
        .reverse()
        .map(monday => ({
          label: textualPrettyFormatWeek(monday),
          nativeInputProps: {
            checked: initialWeeks.includes(monday),
            onChange: e => toggleInfraction(monday, e.target.checked)
          }
        }))}
    />
  );
};
