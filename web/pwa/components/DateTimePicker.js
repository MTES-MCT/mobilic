import { formatDateTime } from "common/utils/time";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import React from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import { DateTimePicker as MaterialPicker } from "@material-ui/pickers";

export function DateTimePicker({
  label,
  time,
  setTime,
  error,
  setError,
  minTime,
  maxTime,
  required,
  disabled,
  noValidate,
  clearable = false,
  format = "dd/MM/yyyy HH:mm",
  ...props
}) {
  const validatesTime = () => {
    if (!noValidate) {
      if (minTime && time <= minTime) {
        setError(`L'heure doit être après ${formatDateTime(minTime)}`);
      } else if (maxTime && time >= maxTime) {
        setError(`L'heure doit être avant ${formatDateTime(maxTime)}`);
      } else setError("");
    }
    return () => {};
  };

  React.useEffect(validatesTime, [time, minTime, maxTime]);

  const handleChange = dt => {
    if (dt) setTime(dt.getTime() / 1000);
    else setTime(null);
  };

  return (
    <MaterialPicker
      label={label}
      required={required || false}
      disabled={disabled || false}
      fullWidth
      autoOk={true}
      value={time ? new Date(time * 1000) : null}
      inputProps={{
        step: 60
      }}
      openTo="minutes"
      ampm={false}
      views={["date", "month", "hours", "minutes"]}
      format={format}
      onChange={handleChange}
      error={!!error}
      helperText={error}
      InputProps={
        clearable
          ? {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setTime(null)}
                    onMouseDown={e => e.preventDefault()}
                  >
                    <HighlightOffIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          : {}
      }
      {...props}
    />
  );
}
