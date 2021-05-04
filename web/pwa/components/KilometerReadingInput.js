import React from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import SpeedIcon from "@material-ui/icons/Speed";
import TextField from "common/utils/TextField";

export default function KilometerReadingInput({
  kilometerReading,
  setKilometerReading,
  minReading = null,
  error = null,
  setError = null,
  ...other
}) {
  React.useEffect(() => {
    if (
      kilometerReading !== null &&
      minReading &&
      kilometerReading < minReading &&
      setError
    )
      setError(`Le nombre ne peut pas être en-dessous de ${minReading} km.`);
    else if (setError) setError(null);
  }, [kilometerReading]);

  return (
    <TextField
      label="Relevé kilométrique"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SpeedIcon />
          </InputAdornment>
        ),
        endAdornment: <InputAdornment position="end">km</InputAdornment>
      }}
      error={!!error}
      helperText={error || ""}
      inputProps={minReading ? { min: minReading } : {}}
      variant="filled"
      type="number"
      value={kilometerReading}
      onChange={e => setKilometerReading(parseInt(e.target.value))}
      {...other}
    />
  );
}
