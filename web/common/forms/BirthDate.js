import React from "react";

import classNames from "classnames";
import { CURRENT_YEAR } from "common/utils/time";
import { Input } from "./Input";

const BIRTH_DATE_MIN_YEAR = 100;
const BIRTH_DATE_MAX_YEAR = 18;

export function BirthDate({ label, userBirthDate, setUserBirthDate }) {
  const [day, setDay] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");

  const [dayState, setDayState] = React.useState("default");
  const [monthState, setMonthState] = React.useState("default");
  const [yearState, setYearState] = React.useState("default");
  const [dateState, setDateState] = React.useState("default");

  React.useEffect(() => {
    if (!userBirthDate) {
      setDay("");
      setMonth("");
      setYear("");
      return;
    }
    const date = new Date(userBirthDate);
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
    setDay(date.getDate());
  }, [userBirthDate]);

  const MAX_BIRTH_DATE_YEAR = React.useMemo(
    () => CURRENT_YEAR - BIRTH_DATE_MAX_YEAR,
    [CURRENT_YEAR]
  );
  const MIN_BIRTH_DATE_YEAR = React.useMemo(
    () => CURRENT_YEAR - BIRTH_DATE_MIN_YEAR,
    [CURRENT_YEAR]
  );

  const onValidateBirthDate = () => {
    let hasError = false;
    if (
      year !== "" &&
      (year < MIN_BIRTH_DATE_YEAR || year > MAX_BIRTH_DATE_YEAR)
    ) {
      setYearState("error");
      hasError = true;
    } else {
      setYearState("default");
    }
    if (month !== "" && (month < 1 || month > 12)) {
      setMonthState("error");
      hasError = true;
    } else {
      setMonthState("default");
    }
    if (day !== "" && (day < 1 || day > 31)) {
      setDayState("error");
      hasError = true;
    } else {
      setDayState("default");
    }

    if (!hasError && day !== "" && month !== "" && year !== "") {
      const date = new Date(year, month - 1, day, 10, 0, 0, 0);
      const validYear = date.getFullYear() === parseInt(year);
      const validMonth = date.getMonth() === parseInt(month - 1);
      const validDay = date.getDate() === parseInt(day);
      if (validYear && validMonth && validDay) {
        setDateState("default");
        const newDateString = date.toISOString().split("T")[0];
        setUserBirthDate(newDateString);
      } else {
        setDateState("error");
      }
    } else {
      setDateState("default");
    }
  };

  return (
    <fieldset
      role="group"
      aria-labelledby="date-naissance-salarie"
      aria-describedby="date-naissance-salarie-error"
      className={classNames(
        "fr-fieldset",
        dateState === "error" ? "fr-input-group--error" : ""
      )}
      style={{ alignItems: "flex-start" }}
    >
      <legend className="fr-fieldset__legend" id="date-naissance-salarie">
        {label}
      </legend>
      <div className="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--number">
        <Input
          nativeInputProps={{
            value: day,
            onChange: e => setDay(e.target.value),
            onBlur: onValidateBirthDate,
            type: "number",
            inputMode: "numeric"
          }}
          type="number"
          label="Jour"
          hintText="Entre 1 et 31"
          required
          state={dayState}
          stateRelatedMessage="Jour invalide. Exemple&nbsp;: 14."
        />
      </div>
      <div className="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--number">
        <Input
          nativeInputProps={{
            value: month,
            onChange: e => setMonth(e.target.value),
            onBlur: onValidateBirthDate,
            type: "number",
            inputMode: "numeric"
          }}
          label="Mois"
          hintText="Entre 1 et 12"
          required
          state={monthState}
          stateRelatedMessage="Mois invalide. Exemple&nbsp;: 12."
        />
      </div>
      <div className="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--inline-grow fr-fieldset__element--year">
        <Input
          nativeInputProps={{
            value: year,
            onChange: e => setYear(e.target.value),
            onBlur: onValidateBirthDate,
            type: "number",
            inputMode: "numeric"
          }}
          label="Année"
          hintText="Exemple&nbsp;: 1984"
          required
          state={yearState}
          stateRelatedMessage="Année invalide&nbsp;: elle doit être comprise entre 1924 et 2006. Exemple : 1990."
        />
      </div>
      {dateState === "error" && (
        <p id="date-naissance-salarie-error" className="fr-error-text">
          Date invalide&nbsp;: ce jour n'existe pas.
        </p>
      )}
    </fieldset>
  );
}
