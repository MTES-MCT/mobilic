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
import { useControl } from "../../../controller/utils/contextControl";
import { capitalizeFirstLetter } from "common/utils/string";
import classNames from "classnames";

const controlHistoryDepth =
  parseInt(process.env.REACT_APP_USER_CONTROL_HISTORY_DEPTH) || 28;

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
    border: "1px solid",
    borderColor: fr.colors.decisions.background.disabled.grey.default,
    borderRadius: "0px",
    boxShadow: "none"
  }
}));

export const InfractionDay = ({ alerts, sanction }) => {
  const classes = useStyles();
  const {
    isReportingInfractions,
    onAddInfraction,
    onRemoveInfraction
  } = useInfractions();
  const { controlData } = useControl();

  const initialDays = useMemo(
    () => alerts.map(alert => alert.day).filter(x => !!x),
    [alerts]
  );

  const initialTimestamps = useMemo(() => initialDays.map(unixToJSTimestamp), [
    initialDays
  ]);

  const maxDate = new Date(unixToJSTimestamp(controlData.creationTime));
  const minDate = addDaysToDate(new Date(maxDate), -controlHistoryDepth);

  const onSelectedDatesChange = values => {
    const selectedTimestamps = values
      .map(dateString => {
        const parsedDate = new Date(dateString);
        return parsedDate.getTime();
      })
      .map(date => (date / 1000) >> 0);

    const newTimestamps = selectedTimestamps.filter(
      ts => !initialDays.includes(ts)
    );

    for (const newTimestamp of newTimestamps) {
      onAddInfraction(sanction, newTimestamp);
    }

    const removedTimestamps = initialDays.filter(
      ts => !selectedTimestamps.includes(ts)
    );
    for (const removedTimestamp of removedTimestamps) {
      onRemoveInfraction(sanction, removedTimestamp);
    }
  };

  const onRemoveDate = timestamp => {
    onRemoveInfraction(sanction, timestamp);
  };

  if (!isReportingInfractions && !initialTimestamps) {
    return null;
  }

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
          className={classNames(classes.calendar, "custom-calendar")}
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
      {initialTimestamps?.length > 0 && (
        <ul
          className="fr-tag-group"
          style={{ listStyleType: "none", paddingInlineStart: "0" }}
        >
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
                      "aria-label": `Retirer ${capitalizeFirstLetter(
                        textualPrettyFormatDay(ts, true)
                      )}`
                    })
                  }}
                >
                  {capitalizeFirstLetter(textualPrettyFormatDay(ts, true))}
                </Tag>
              </li>
            ))}
        </ul>
      )}
    </Stack>
  );
};
