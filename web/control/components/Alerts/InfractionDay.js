import React, { useMemo } from "react";
import { Calendar } from "react-multi-date-picker";
import {
  addDaysToDate,
  textualPrettyFormatDay,
  unixToJSTimestamp
} from "common/utils/time";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import Stack from "@mui/material/Stack";
import { useInfractions } from "../../../controller/utils/contextInfractions";

const gregorian_fr = {
  name: "gregorian_fr",
  months: [
    ["Janvier", "Jan"],
    ["Février", "Fév"],
    ["Mars", "Mars"],
    ["Avril", "Avr"],
    ["Mai", "Mai"],
    ["Juin", "Jun"],
    ["Juillet", "Jul"],
    ["Août", "Aou"],
    ["Septembre", "Sep"],
    ["Octobre", "Oct"],
    ["Novembre", "Nov"],
    ["Décembre", "Déc"]
  ],
  weekDays: [
    ["Samedi", "S"],
    ["Dimanche", "D"],
    ["Lundi", "L"],
    ["Mardi", "M"],
    ["Mercredi", "M"],
    ["Jeudi", "J"],
    ["Vendredi", "V"]
  ],
  digits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  meridiems: [
    ["AM", "am"],
    ["PM", "pm"]
  ]
};

const useStyles = makeStyles(theme => ({
  calendar: {
    margin: "auto",
    border: "1px solid",
    borderColor: fr.colors.decisions.background.disabled.grey.default,
    borderRadius: "0px",
    boxShadow: "none"
  }
}));

export const InfractionDay = ({ alerts, sanction, controlData }) => {
  const classes = useStyles();
  const {
    isReportingInfractions,
    onAddInfraction,
    onRemoveInfraction
  } = useInfractions();

  const initialDays = useMemo(
    () => alerts.map(alert => alert.day).filter(x => !!x),
    [alerts]
  );

  const initialTimestamps = useMemo(() => initialDays.map(unixToJSTimestamp), [
    initialDays
  ]);

  const maxDate = new Date(unixToJSTimestamp(controlData.creationTime));
  const minDate = addDaysToDate(new Date(maxDate), -28);

  const onSelectedDatesChange = values => {
    const newTimestamps = values
      .map(dateString => {
        const parsedDate = new Date(dateString);
        return parsedDate.getTime();
      })
      .map(date => (date / 1000) >> 0)
      .filter(ts => !initialDays.includes(ts));

    for (const newTimestamp of newTimestamps) {
      onAddInfraction(sanction, newTimestamp);
    }
  };

  const onRemoveDate = timestamp => {
    onRemoveInfraction(sanction, timestamp);
  };

  return (
    <Stack direction="column" gap={2}>
      {isReportingInfractions && (
        <p style={{ marginBottom: 0 }}>
          Sélectionnez la ou les journées concernées&nbsp;:
        </p>
      )}
      {isReportingInfractions && (
        // Documentation: https://shahabyazdi.github.io/react-multi-date-picker/
        <Calendar
          className={classes.calendar}
          value={initialTimestamps}
          onChange={onSelectedDatesChange}
          multiple
          sort
          minDate={minDate}
          maxDate={maxDate}
          highlightToday={false}
          weekStartDayIndex={1}
          headerOrder={["MONTH_YEAR", "LEFT_BUTTON", "RIGHT_BUTTON"]}
          monthYearSeparator=" "
          locale={gregorian_fr}
        />
      )}
      <ul className="fr-tag-group" style={{ listStyleType: "none" }}>
        {initialTimestamps
          .map(ts => (ts / 1000) >> 0)
          .sort()
          .map(ts => (
            <li key={ts}>
              <Tag
                dismissible={isReportingInfractions}
                nativeButtonProps={{
                  ...(isReportingInfractions && {
                    onClick: () => onRemoveDate(ts),
                    "aria-label": `Retirer ${textualPrettyFormatDay(ts, true)}`
                  })
                }}
              >
                {textualPrettyFormatDay(ts, true)}
              </Tag>
            </li>
          ))}
      </ul>
    </Stack>
  );
};
