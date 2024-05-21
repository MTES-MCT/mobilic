import React from "react";
import PhoneInput from "react-phone-input-2";
import examples from "libphonenumber-js/mobile/examples";
import { getExampleNumber, isPossiblePhoneNumber } from "libphonenumber-js";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  label: {
    textAlign: "left"
  }
}));

export function PhoneNumber({
  currentPhoneNumber,
  setCurrentPhoneNumber,
  label = "Numéro de téléphone",
  isInModal = false
}) {
  const classes = useStyles();

  const [phoneNumber, setPhoneNumber] = React.useState(currentPhoneNumber);
  const [currentCountry, setCurrentCountry] = React.useState("FR");

  React.useEffect(() => {
    if (phoneNumber && isPossiblePhoneNumber(phoneNumber)) {
      setCurrentPhoneNumber(phoneNumber);
    }
  }, [phoneNumber]);

  const numberExample = React.useMemo(
    () => getExampleNumber(currentCountry, examples).formatInternational(),
    [currentCountry]
  );

  return (
    <div className="fr-input-group">
      <label htmlFor="phone-input" className={`fr-label ${classes.label}`}>
        {label}
        <span className="fr-hint-text">Format attendu : {numberExample}</span>
      </label>
      <PhoneInput
        placeholder=""
        value={phoneNumber}
        onChange={(newNumber, newCountry, e, formattedValue) => {
          setPhoneNumber(formattedValue);
          setCurrentCountry(newCountry.countryCode.toUpperCase());
        }}
        inputClass="fr-input"
        country={"fr"}
        onlyCountries={["fr", "it"]}
        dropdownStyle={isInModal ? { position: "fixed" } : {}}
        inputStyle={{
          marginLeft: "3rem",
          paddingLeft: "0.5rem",
          backgroundColor: "none",
          position: "relative"
        }}
        countryCodeEditable={false}
        containerStyle={{
          width: "100%",
          position: "relative"
        }}
      />
    </div>
  );
}
