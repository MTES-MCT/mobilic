import React, { useMemo } from "react";
import Stack from "@mui/material/Stack";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { startOfDay, textualPrettyFormatWeek } from "common/utils/time";
import { useInfractions } from "../../../controller/utils/contextInfractions";

const getLastFourMondays = () => {
  const mondays = [];
  const today = new Date();
  let date = new Date(today);

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
    <Stack direction="column" gap={2}>
      {isReportingInfractions && (
        <p style={{ marginBottom: 0 }}>
          Sélectionnez la ou les semaines concernées&nbsp;:
        </p>
      )}
      {getLastFourMondays().map(monday => (
        <Checkbox
          key={monday}
          style={{ margin: 0 }}
          legend=""
          options={[
            {
              label: textualPrettyFormatWeek(monday),
              nativeInputProps: {
                checked: initialWeeks.includes(monday),
                onChange: e => toggleInfraction(monday, e.target.checked)
              }
            }
          ]}
          disabled={!isReportingInfractions}
        />
      ))}
    </Stack>
  );
};
