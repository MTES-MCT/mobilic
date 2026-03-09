import React from "react";
import {
  cleanEmailString,
  validateCleanEmailString
} from "common/utils/validation";
import { Input } from "./forms/Input";

export function EmailField({
  value,
  setValue,
  error,
  setError,
  validate,
  label = "Email professionnel",
  required = false,
  showHint = false,
  ...props
}) {
  const [actualInput, setActualInput] = React.useState(value);

  React.useEffect(() => {
    if (validate && value && value !== "" && !validateCleanEmailString(value)) {
      setError(
        "Le format de l'adresse saisie n'est pas valide. Le format attendu est prenom.nom@domaine.fr."
      );
    } else if (error && setError) {
      setError("");
    } else if (value && value !== "") {
      setActualInput(value);
    }
  }, [value]);

  return (
    <Input
      label={label}
      hintText={showHint && "Exemple de format attendu : prenom.nom@domaine.fr"}
      state={error ? "error" : "default"}
      stateRelatedMessage={error}
      nativeInputProps={{
        type: "email",
        value: actualInput,
        onChange: e => {
          const newValue = e.target.value;
          const cleanValue = newValue ? cleanEmailString(newValue) : newValue;
          setActualInput(newValue);
          setValue(cleanValue);
        },
        ...props
      }}
      required={required}
    />
  );
}
