import {
  formatDateTime,
  frenchFormatDateStringOrTimeStamp,
  getEndOfDay,
  getStartOfDay,
  isoFormatDateTime
} from "common/utils/time";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import React from "react";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import {
  DateTimePicker as MaterialDateTimePicker,
  DatePicker as MaterialDatePicker
} from "@material-ui/pickers";
import TextField from "common/utils/TextField";

export function DateOrDateTimePicker({
  label,
  value,
  isDateTime = true,
  setValue,
  error,
  variant,
  className,
  setError,
  minValue,
  maxValue,
  required,
  disabled,
  noValidate,
  clearable = false,
  format = null,
  autoValidate = false
}) {
  const [isNative, setIsNative] = React.useState(true);
  const ref = React.useRef();

  const actualFormat =
    format || (isDateTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");
  const displayValue = isDateTime
    ? formatDateTime
    : frenchFormatDateStringOrTimeStamp;

  const autoValidateValue = () => {
    if (autoValidate) {
      if (minValue && value <= minValue) {
        setError(
          `${isDateTime ? "L'heure" : "Le jour"} doit être après ${
            isDateTime ? "" : "le "
          }${displayValue(minValue)}`
        );
      } else if (maxValue && value >= maxValue) {
        setError(
          `${isDateTime ? "L'heure" : "Le jour"} doit être avant ${
            isDateTime ? "" : "le "
          }${displayValue(maxValue)}`
        );
      } else setError("");
    }
    return () => {};
  };

  React.useEffect(autoValidateValue, [value, minValue, maxValue]);

  React.useEffect(() => {
    if (
      isNative &&
      ref.current &&
      ref.current.type !== (isDateTime ? "datetime-local" : "date")
    )
      setIsNative(false);
  }, [ref.current]);

  const props = {
    label,
    value,
    isDateTime,
    className,
    setValue,
    minValue,
    maxValue,
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
  if (isNative) return <NativeDateOrDateTimePicker ref={ref} {...props} />;
  return <MaterialUIDateOrDateTimePicker format={actualFormat} {...props} />;
}

const NativeDateOrDateTimePicker = React.forwardRef(
  ({ value, isDateTime, setValue, minValue, maxValue, ...props }, ref) => {
    React.useEffect(() => {
      setTimeout(() => {
        if (ref.current) ref.current.defaultValue = "";
      }, 0);
    }, []);

    function fromBrowserRepresentation(val) {
      if (isDateTime) {
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
      return val;
    }
    const toBrowserRepresentation = isDateTime
      ? isoFormatDateTime
      : date => date;

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
        type={isDateTime ? "datetime-local" : "date"}
        value={value ? toBrowserRepresentation(value) : ""}
        inputProps={{
          step: isDateTime ? 60 : 1,
          min: minValue
            ? toBrowserRepresentation(getStartOfDay(minValue))
            : null,
          max: maxValue ? toBrowserRepresentation(getEndOfDay(maxValue)) : null
        }}
        onChange={handleChange}
        inputRef={ref}
        {...props}
      />
    );
  }
);

function MaterialUIDateOrDateTimePicker({
  value,
  setValue,
  isDateTime,
  maxValue,
  minValue,
  format,
  ...props
}) {
  const handleChange = val => {
    if (val) setValue(fromMaterialUIRepresentation(val));
    else setValue(null);
  };

  const fromMaterialUIRepresentation = isDateTime
    ? dt => dt.getTime() / 1000
    : date => date;
  const toMaterialUIRepresentation = isDateTime
    ? time => new Date(time * 1000)
    : date => date;

  const customProps = isDateTime
    ? { ampm: false, minTime: minValue, maxTime: maxValue }
    : { minDate: minValue, maxDate: maxValue };
  const MaterialPicker = isDateTime
    ? MaterialDateTimePicker
    : MaterialDatePicker;

  return (
    <MaterialPicker
      autoOk={true}
      value={value ? toMaterialUIRepresentation(value) : ""}
      inputProps={{
        step: isDateTime ? 60 : 1
      }}
      openTo={isDateTime ? "hours" : "date"}
      views={
        isDateTime
          ? ["date", "month", "hours", "minutes"]
          : ["year", "month", "date"]
      }
      format={format}
      onChange={handleChange}
      inputVariant={props.variant}
      {...customProps}
      {...props}
    />
  );
}
