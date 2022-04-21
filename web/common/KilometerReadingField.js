import React from "react";
import InputAdornment from "@mui/material/InputAdornment";
import SpeedIcon from "@mui/icons-material/Speed";
import TextField from "common/utils/TextField";

export default function KilometerReadingField({
  kilometerReading,
  setKilometerReading,
  minReading = null,
  maxReading = null,
  error = null,
  setError = null,
  ...other
}) {
  React.useEffect(() => {
    if ((kilometerReading || kilometerReading === 0) && setError) {
      if (minReading && kilometerReading < minReading) {
        setError(`Le nombre ne peut pas être en-dessous de ${minReading} km.`);
        return;
      }
      if (maxReading && kilometerReading > maxReading) {
        setError(`Le nombre ne peut pas être au-dessus de ${maxReading} km.`);
        return;
      }
    }
    if (setError) setError(null);
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
