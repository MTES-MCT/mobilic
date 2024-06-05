import React from "react";
import examples from "libphonenumber-js/mobile/examples";
import {
  AsYouType,
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumber
} from "libphonenumber-js";
import { makeStyles } from "@mui/styles";
import Flag from "react-world-flags";
import { MenuItem, Select, Stack } from "@mui/material";
import { TextInput } from "@dataesr/react-dsfr";

const useStyles = makeStyles(theme => ({
  label: {
    textAlign: "left"
  }
}));

const COUNTRIES = [
  {
    code: "FR",
    label: "France"
  },
  {
    code: "ES",
    label: "Espagne"
  },
  {
    code: "BE",
    label: "Belgique"
  },
  {
    code: "IT",
    label: "Italie"
  }
];

export function PhoneNumber({
  currentPhoneNumber,
  setCurrentPhoneNumber,
  label = "Numéro de téléphone",
  accessibilityHelpText = ""
}) {
  const classes = useStyles();

  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [currentCountry, setCurrentCountry] = React.useState("FR");
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    try {
      const parsedNumber = parsePhoneNumber(currentPhoneNumber);
      if (parsedNumber) {
        setCurrentCountry(parsedNumber.country);
        setPhoneNumber(parsedNumber.formatNational());
      }
    } catch {
      setPhoneNumber(currentPhoneNumber);
      setCurrentCountry("FR");
    }
  }, [currentPhoneNumber]);

  const numberExample = React.useMemo(
    () => getExampleNumber(currentCountry, examples).formatNational(),
    [currentCountry]
  );

  const onInput = number => {
    const formatter = new AsYouType(currentCountry);
    const formattedValue = formatter.input(number);
    if (formatter.isPossible()) {
      const parsedPhoneNumber = parsePhoneNumber(
        formattedValue,
        currentCountry
      );
      setCurrentPhoneNumber(parsedPhoneNumber.format("E.164"));
      setErrorMessage("");
    } else {
      if (number) {
        setErrorMessage(
          `Le format de numéro de téléphone saisie n’est pas valide.`
        );
      }
    }
    setPhoneNumber(formattedValue || number);
  };

  return (
    <div
      className="fr-input-group"
      role="group"
      aria-labelledby="phone-number-title"
    >
      <label
        id="phone-number-title"
        htmlFor="phone-number-input"
        className={`fr-label ${classes.label}`}
      >
        {label}
        <span className="fr-sr-only"> {accessibilityHelpText}</span>
        <span className="fr-hint-text">Format attendu : {numberExample}</span>
      </label>
      <Stack direction="row" spacing={1}>
        <Select
          hiddenLabel
          variant="filled"
          size="small"
          value={currentCountry}
          onChange={e => setCurrentCountry(e.target.value)}
          native={false}
          renderValue={c => (
            <Flag code={c} height="17" style={{ paddingTop: "0.25rem" }} />
          )}
          sx={{ height: "2.5rem" }}
        >
          {COUNTRIES.map(({ code, label }) => (
            <MenuItem key={code} value={code}>
              <Flag code={code} width="24" style={{ marginRight: "1rem" }} />{" "}
              {label} (+{getCountryCallingCode(code)})
            </MenuItem>
          ))}
        </Select>
        <TextInput
          id="phone-number-input"
          value={phoneNumber}
          onChange={e => onInput(e.target.value)}
          messageType={errorMessage && "error"}
          message={errorMessage}
          autoComplete="tel"
        />
      </Stack>
    </div>
  );
}
