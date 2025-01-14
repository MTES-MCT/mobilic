import React from "react";
import { Select } from "./forms/Select";
import { GENDERS } from "common/utils/gender";

const GenderSelect = ({ currentGender, onGenderChange }) => {
  return (
    <>
      <Select
        label="Sexe"
        nativeSelectProps={{
          onChange: e => onGenderChange(e.target.value),
          value: currentGender
        }}
        required
      >
        {GENDERS.map(gender => (
          <option key={`gender__${gender.value}`} value={gender.value}>
            {gender.label}
          </option>
        ))}
      </Select>
    </>
  );
};

export default GenderSelect;
