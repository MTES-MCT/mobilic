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
  label = "Email",
  required = false,
  hintText,
  ...props
}) {
  React.useEffect(() => {
    if (validate && value && value !== "" && !validateCleanEmailString(value)) {
      setError(
        "Le format de l'adresse saisie n'est pas valide. Le format attendu est prenom.nom@domaine.fr."
      );
    } else if (error && setError) setError("");
  }, [value]);

  const [actualInput, setActualInput] = React.useState(value);

  return (
    <Input
      label={label}
      hintText={hintText}
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
