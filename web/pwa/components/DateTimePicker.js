import { formatDateTime, isoFormatDateTime } from "common/utils/time";
import TextField from "@material-ui/core/TextField";
import React from "react";

export function DateTimePicker({
  label,
  time,
  setTime,
  error,
  setError,
  minTime,
  maxTime,
  required,
  disabled
}) {
  const validatesTime = () => {
    if (time <= minTime) {
      setError(`L'heure doit être après ${formatDateTime(minTime)}`);
    } else if (time >= maxTime) {
      setError(`L'heure doit être avant ${formatDateTime(maxTime)}`);
    } else setError("");
    return () => {};
  };

  React.useEffect(validatesTime, [time, minTime, maxTime]);

  const handleChange = e => {
    const dayVsTime = e.target.value.split("T");
    const dayElements = dayVsTime[0].split("-");
    const timeElements = dayVsTime[1].split(":");
    const newRevisedEventTime = new Date(time);
    newRevisedEventTime.setFullYear(parseInt(dayElements[0]));
    newRevisedEventTime.setMonth(parseInt(dayElements[1]) - 1);
    newRevisedEventTime.setDate(parseInt(dayElements[2]));
    newRevisedEventTime.setHours(parseInt(timeElements[0]));
    newRevisedEventTime.setMinutes(parseInt(timeElements[1]));
    setTime(newRevisedEventTime.getTime());
  };

  return (
    <TextField
      label={label}
      type="datetime-local"
      required={required || false}
      disabled={disabled || false}
      fullWidth
      value={isoFormatDateTime(time)}
      inputProps={{
        step: 60
      }}
      onChange={handleChange}
      error={!!error}
      helperText={error}
    />
  );
}
