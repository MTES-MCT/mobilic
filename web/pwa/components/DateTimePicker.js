import { formatDateTime, isoFormatDateTime } from "common/utils/time";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import React from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import { DateTimePicker as MaterialPicker } from "@material-ui/pickers";
import TextField from "common/utils/TextField";

export function DateTimePicker({
  label,
  time,
  setTime,
  error,
  variant,
  className,
  setError,
  minTime,
  maxTime,
  required,
  disabled,
  noValidate,
  clearable = false,
  format = "dd/MM/yyyy HH:mm",
  autoValidate = false
}) {
  const [isNative, setIsNative] = React.useState(true);
  const ref = React.useRef();

  const autoValidatesTime = () => {
    if (autoValidate) {
      if (minTime && time <= minTime) {
        setError(`L'heure doit être après ${formatDateTime(minTime)}`);
      } else if (maxTime && time >= maxTime) {
        setError(`L'heure doit être avant ${formatDateTime(maxTime)}`);
      } else setError("");
    }
    return () => {};
  };

  React.useEffect(autoValidatesTime, [time, minTime, maxTime]);

  React.useEffect(() => {
    if (isNative && ref.current && ref.current.type !== "datetime-local")
      setIsNative(false);
  }, [ref.current]);

  const props = {
    label,
    time,
    className,
    setTime,
    minTime,
    maxTime,
    noValidate,
    variant,
    required: required || false,
    disabled: disabled || false,
    fullWidth: true,
    error: !!error,
    helperText: error,
    InputProps: clearable
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
  };
  if (isNative) return <NativeDateTimePicker ref={ref} {...props} />;
  return <MaterialUIDateTimePicker format={format} {...props} />;
}

const NativeDateTimePicker = React.forwardRef(
  ({ time, setTime, minTime, maxTime, ...props }, ref) => {
    React.useEffect(() => {
      setTimeout(() => {
        if (ref.current) ref.current.defaultValue = "";
      }, 0);
    }, []);

    const handleChange = e => {
      if (!e.target.value || e.target.value === "") {
        if (!props.required) setTime(null);
        return;
      }

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

      const target = e.target;
      setTimeout(() => {
        target.defaultValue = "";
      }, 0);
    };

    return (
      <TextField
        type="datetime-local"
        value={time ? isoFormatDateTime(time) : ""}
        inputProps={{
          step: 60,
          min: minTime ? isoFormatDateTime(minTime) : null,
          max: maxTime ? isoFormatDateTime(maxTime) : null
        }}
        onChange={handleChange}
        inputRef={ref}
        {...props}
      />
    );
  }
);

function MaterialUIDateTimePicker({
  time,
  setTime,
  format = "dd/MM/yyyy HH:mm",
  ...props
}) {
  const handleChange = dt => {
    if (dt) setTime(dt.getTime() / 1000);
    else setTime(null);
  };

  return (
    <MaterialPicker
      autoOk={true}
      value={time ? new Date(time * 1000) : null}
      inputProps={{
        step: 60
      }}
      openTo="hours"
      ampm={false}
      views={["date", "month", "hours", "minutes"]}
      format={format}
      onChange={handleChange}
      inputVariant={props.variant}
      {...props}
    />
  );
}
