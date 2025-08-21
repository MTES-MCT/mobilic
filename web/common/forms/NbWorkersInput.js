import React from "react";
import { NumericInput } from "./NumericInput";

export const MIN_NB_WORKERS = 1;
export const MAX_NB_WORKERS = 5000;
const NB_WORKERS_HINT_TEXT =
  "Exemples : chauffeurs, accompagnateurs, ripeurs...";
const NB_WORKERS_LABEL = "Nombre de salariés concernés par Mobilic";

export function NbWorkersInput({
  value,
  label,
  hint,
  initialValue,
  onChangeValue,
  required = true,
  ...props
}) {
  return (
    <NumericInput
      value={value}
      initialValue={initialValue}
      onChangeValue={onChangeValue}
      label={label || NB_WORKERS_LABEL}
      hintText={hint || NB_WORKERS_HINT_TEXT}
      required={required}
      min={MIN_NB_WORKERS}
      max={MAX_NB_WORKERS}
      {...props}
    />
  );
}
