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

  const monthInputRef = React.useRef(null);
  const yearInputRef = React.useRef(null);

  const dayFocusTimeoutRef = React.useRef(null);
  const DELAY_FOCUS_MONTH = 800; 


  React.useEffect(() => () => {
    if (dayFocusTimeoutRef.current) {
      clearTimeout(dayFocusTimeoutRef.current);
    }
  }, []);

  const inputFocus = (inputRef) => {
    const target = inputRef?.current;

    if (!target) {
      return;
    }
    const nestedInput = 
      target.tagName === "INPUT" ? target : target.querySelector?.("input");

    if (nestedInput && typeof nestedInput.focus === "function") {
      nestedInput.focus();
    }
  };

  const normalizedNumeric = (value, maxLength) =>
    value.replace(/\D/g, "")/*.replace(/^0+/, "")*/.slice(0, maxLength);
  
  React.useEffect(() => {
    if (!userBirthDate) {
      setDay("");
      setMonth("");
      setYear("");
      return;
    }
    const date = new Date(userBirthDate);
    setYear(String(date.getFullYear()));
    setMonth(String(date.getMonth() + 1));
    setDay(String(date.getDate()));
  }, [userBirthDate]);

  const MAX_BIRTH_DATE_YEAR = React.useMemo(
    () => CURRENT_YEAR - BIRTH_DATE_MAX_YEAR,
    [CURRENT_YEAR]
  );
  const MIN_BIRTH_DATE_YEAR = React.useMemo(
    () => CURRENT_YEAR - BIRTH_DATE_MIN_YEAR,
    [CURRENT_YEAR]
  );

  const handleInputChange = (type, value) => {
    switch (type) {
      case "day":
        {
          const day = normalizedNumeric(value, 2);
          setDay(day);
          clearTimeout(dayFocusTimeoutRef.current);
          if (day.length === 2) {
            inputFocus(monthInputRef);
          } else if (day.length === 1) {
            dayFocusTimeoutRef.current = setTimeout(() => {
              inputFocus(monthInputRef);
            }, DELAY_FOCUS_MONTH);
          }
        }
        break;
      case "month":
        {
          const month = normalizedNumeric(value, 2);
          setMonth(month);
          if (month.length === 2) {
            inputFocus(yearInputRef);
          }
        }
        break;
      case "year":
        {
          const year = normalizedNumeric(value, 4);
          setYear(year);
        }
        break;
      default:
        break;
    }
  }

  const onValidateBirthDate = () => {
    let hasError = false;

    if (
      year !== "" &&
      year.length === 4 &&
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

  // Debounce validation to avoid validating on every keystroke
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onValidateBirthDate();
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [day, month, year]);

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
            onChange: e => handleInputChange("day", e.target.value),
            onBlur: e => {
              clearTimeout(dayFocusTimeoutRef.current);
              onValidateBirthDate(e);
            },
            type: "text",
            inputMode: "numeric",
            maxLength: 2
          }}
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
            onChange: e => handleInputChange("month", e.target.value),
            onBlur: onValidateBirthDate,
            type: "text",
            inputMode: "numeric",
            maxLength: 2
          }}
          label="Mois"
          hintText="Entre 01 et 12"
          required
          state={monthState}
          stateRelatedMessage="Mois invalide. Exemple&nbsp;: 12."
          ref={monthInputRef}
        />
      </div>
      <div className="fr-fieldset__element fr-fieldset__element--inline fr-fieldset__element--inline-grow fr-fieldset__element--year">
        <Input
          nativeInputProps={{
            value: year,
            onChange: e => handleInputChange("year", e.target.value),
            onBlur: onValidateBirthDate,
            type: "text",
            inputMode: "numeric",
            maxLength: 4
          }}
          label="Année"
          hintText="Exemple&nbsp;: 1984"
          required
          state={yearState}
          stateRelatedMessage="Année invalide&nbsp;: elle doit être comprise entre 1924 et 2006. Exemple : 1990."
          ref={yearInputRef}
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
