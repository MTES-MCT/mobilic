import TextField from "@material-ui/core/TextField/TextField";
import React from "react";
import {
  cleanEmailString,
  validateCleanEmailString
} from "common/utils/validation";

export function EmailField({
  value,
  setValue,
  error,
  setError,
  validate,
  ...props
}) {
  React.useEffect(() => {
    if (validate && value && value !== "" && !validateCleanEmailString(value)) {
      setError("Le format de l'adresse n'est pas valide");
    } else if (error && setError) setError(null);
  }, [value]);

  return (
    <TextField
      type="email"
      value={value}
      onChange={e => {
        const newValue = e.target.value;
        const cleanValue = newValue ? cleanEmailString(newValue) : newValue;
        setValue(cleanValue);
      }}
      error={!!error}
      helperText={error}
      {...props}
    />
  );
}
