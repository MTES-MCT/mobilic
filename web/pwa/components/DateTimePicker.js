import { formatDateTime, isoFormatDateTime } from "common/utils/time";
import TextField from "@material-ui/core/TextField";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import React from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";

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
  clearable = false
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

  const handleChange = e => {
    const dayVsTime = e.target.value.split("T");
    const dayElements = dayVsTime[0].split("-");
    const timeElements = dayVsTime[1].split(":");
    const newRevisedEventTime = new Date(time * 1000);
    newRevisedEventTime.setFullYear(parseInt(dayElements[0]));
    newRevisedEventTime.setMonth(parseInt(dayElements[1]) - 1);
    newRevisedEventTime.setDate(parseInt(dayElements[2]));
    newRevisedEventTime.setHours(parseInt(timeElements[0]));
    newRevisedEventTime.setMinutes(parseInt(timeElements[1]));
    setTime((newRevisedEventTime.getTime() / 1000) >> 0);
  };

  return (
    <TextField
      label={label}
      type="datetime-local"
      required={required || false}
      disabled={disabled || false}
      fullWidth
      value={time ? isoFormatDateTime(time) : ""}
      inputProps={{
        step: 60
      }}
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
    />
  );
}
