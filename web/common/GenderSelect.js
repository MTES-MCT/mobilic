import React from "react";
import { GENDERS } from "common/utils/gender";
import { RadioButtons } from "./forms/RadioButtons";

const GenderSelect = ({ currentGender, onGenderChange, touched = false }) => {
  const isError = touched && !currentGender;
  return (
    <RadioButtons
      orientation="horizontal"
      legend="Sexe"
      required={true}
      options={GENDERS.map(({ value, label }) => ({
        label,
        nativeInputProps: {
          value,
          checked: currentGender === value
        }
      }))}
      onChange={e => onGenderChange(e.target.value)}
      state={isError ? "error" : "default"}
      stateRelatedMessage={isError ? "Veuillez indiquer votre sexe" : ""}
    />
  );
};

export default GenderSelect;
