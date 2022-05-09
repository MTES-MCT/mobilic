import React from "react";
import {
  getEndOfDay,
  getStartOfDay,
  isoFormatDateTime
} from "common/utils/time";
import TextField from "common/utils/TextField";
import HighlightOffIcon from "@mui/icons-material/Close";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

export function NativeDateTimePicker({
  label,
  value,
  setValue,
  error,
  variant,
  className,
  minDateTime,
  maxDateTime,
  fullWidth = true,
  required = false,
  disabled = false,
  clearable = false
}) {
  const ref = React.useRef();

  React.useEffect(() => {
    setTimeout(() => {
      if (ref.current) ref.current.defaultValue = "";
    }, 0);
  }, []);

  const props = {
    label,
    className,
    variant,
    required,
    disabled,
    fullWidth,
    error: !!error,
    helperText: error,
    InputProps: clearable
      ? {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setValue(null)}
                onMouseDown={e => e.preventDefault()}
              >
                <HighlightOffIcon />
              </IconButton>
            </InputAdornment>
          )
        }
      : {}
  };

  function fromBrowserRepresentation(val) {
    const dayVsTime = val.split("T");
    const dayElements = dayVsTime[0].split("-");
    const timeElements = dayVsTime[1].split(":");
    const newRevisedEventTime = new Date();
    newRevisedEventTime.setFullYear(parseInt(dayElements[0]));
    newRevisedEventTime.setMonth(parseInt(dayElements[1]) - 1);
    newRevisedEventTime.setDate(parseInt(dayElements[2]));
    newRevisedEventTime.setHours(parseInt(timeElements[0]));
    newRevisedEventTime.setMinutes(parseInt(timeElements[1]));
    return (newRevisedEventTime.getTime() / 1000) >> 0;
  }

  const toBrowserRepresentation = isoFormatDateTime;

  const handleChange = e => {
    if (!e.target.value || e.target.value === "") {
      if (!props.required) setValue(null);
      return;
    }

    setValue(fromBrowserRepresentation(e.target.value));

    const target = e.target;
    setTimeout(() => {
      target.defaultValue = "";
    }, 0);
  };

  return (
    <TextField
      type="datetime-local"
      value={value ? toBrowserRepresentation(value) : ""}
      inputProps={{
        step: 60,
        min: minDateTime
          ? toBrowserRepresentation(getStartOfDay(minDateTime))
          : null,
        max: maxDateTime
          ? toBrowserRepresentation(getEndOfDay(maxDateTime))
          : null
      }}
      InputLabelProps={{
        shrink: true
      }}
      onChange={handleChange}
      inputRef={ref}
      {...props}
    />
  );
}
