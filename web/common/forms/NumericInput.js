import React from "react";
import { Input } from "./Input";

export const NumericInput = ({
  initialValue,
  onChangeValue,
  label,
  hintText,
  required = false,
  min = 0,
  max
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [touched, setTouched] = React.useState(false);
  const state = React.useMemo(
    () => (touched && (value < min || value > max) ? "error" : "default"),
    [touched, min, max, value]
  );
  React.useEffect(() => {
    onChangeValue(value);
  }, [value]);
  const errorMessage = React.useMemo(() => {
    if (!touched) {
      return "";
    }
    if (!max || isNaN(parseInt(max))) {
      return `Veuillez entrer une valeur supérieure à ${min}`;
    }
    return `Veuillez entrer une valeur comprise entre ${min} et ${max}`;
  }, [touched, min, max, value]);

  const handleChange = event => {
    const inputValue = event.target.value;
    if (!inputValue) {
      setValue(inputValue);
    }

    const parsedValue = parseInt(inputValue);

    if (!isNaN(parsedValue)) {
      setValue(parsedValue);
    } else {
      event.target.value = value;
    }
  };

  return (
    <Input
      label={label}
      required={required}
      nativeInputProps={{
        value: value,
        onInput: handleChange,
        inputMode: "numeric",
        pattern: "[0-9]*",
        type: "number",
        onBlur: () => setTouched(true)
      }}
      type="number"
      state={state}
      stateRelatedMessage={errorMessage}
      hintText={hintText}
    />
  );
};
