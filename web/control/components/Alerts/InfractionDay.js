import React, { useState } from "react";
import { Calendar } from "react-multi-date-picker";
import { addDaysToDate, textualPrettyFormatDay } from "common/utils/time";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

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

export const InfractionDay = ({
  alert,
  days,
  isReportingInfractions,
  onUpdateInfraction
}) => {
  const [values, setValues] = useState(days); // TODO 835 remove to use props instead

  const today = new Date();
  const minDate = addDaysToDate(new Date(), -28);

  const onSelectedDatesChange = values => {
    console.log("onSelectedDatesChange = " + values);
    setValues(values);
  };

  const onRemoveDate = v => {
    console.log("onRemoveDate = " + v);
    const copyValues = [...values];
    setValues(copyValues.filter(value => value !== v));
  };

  return (
    <div style={{ display: "flex", gap: "16px", flexDirection: "column" }}>
      {isReportingInfractions && (
        <p style={{ marginBottom: 0 }}>
          Sélectionnez la ou les journées concernées&nbsp;:
        </p>
      )}
      {isReportingInfractions && (
        // Documentation: https://shahabyazdi.github.io/react-multi-date-picker/
        <Calendar
          value={values}
          onChange={onSelectedDatesChange}
          multiple
          sort
          minDate={minDate}
          maxDate={today} // TODO 835 use controlDate
          highlightToday={false}
          weekStartDayIndex={1}
          headerOrder={["MONTH_YEAR", "LEFT_BUTTON", "RIGHT_BUTTON"]}
          monthYearSeparator="" // TODO 835 maybe use space
          locale={gregorian_fr}
        />
      )}
      <ul className="fr-tag-group">
        {values.map(date => (
          <li key={date}>
            <Tag
              dismissible={isReportingInfractions}
              nativeButtonProps={{
                ...(isReportingInfractions && {
                  onClick: onRemoveDate,
                  ariaLabel: `Retirer ${textualPrettyFormatDay(
                    (date / 1000) >> 0,
                    true
                  )}`
                })
              }}
            >
              {textualPrettyFormatDay((date / 1000) >> 0, true)}
            </Tag>
          </li>
        ))}
      </ul>
    </div>
  );
};
