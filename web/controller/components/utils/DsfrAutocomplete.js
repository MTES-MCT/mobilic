import Typography from "@mui/material/Typography";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import React from "react";
import Box from "@mui/material/Box";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { MandatorySuffix } from "../../../common/forms/MandatorySuffix";

export function DsfrAutocomplete({
  field,
  fieldLabel,
  disabled,
  onChange,
  showErrors,
  options,
  searchByCodeAndLabel = false
}) {
  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: searchByCodeAndLabel
      ? option => `${option.code} ${option.label}`
      : undefined
  });

  const getOptionLabel = option => {
    if (typeof option === "string") {
      if (searchByCodeAndLabel) {
        const foundOption = options.find(opt => opt.label === option);
        if (foundOption) {
          return `${foundOption.code} - ${foundOption.label}`;
        }
      }
      return option;
    }

    if (searchByCodeAndLabel && option.code && option.label) {
      return `${option.code} - ${option.label}`;
    }
    return option.label || option;
  };

  const getCurrentValue = () => {
    if (!field) return null;

    if (searchByCodeAndLabel) {
      let fieldValue = field;
      if (typeof field === "string" && field.startsWith("{")) {
        try {
          fieldValue = JSON.parse(field);
        } catch {
          // Ignore JSON parse errors
        }
      }
      
      if (typeof fieldValue === "object" && fieldValue.label) {
        return options.find(opt => opt.label === fieldValue.label) || null;
      }
      return options.find(opt => opt.label === fieldValue) || null;
    }

    return field;
  };

  return (
    <Box mb={"1.5rem"}>
      <Typography
        mb={0.5}
        className={!field && showErrors ? "fr-label--error" : "fr-label"}
      >
        {fieldLabel} {<MandatorySuffix />}
      </Typography>
      <Autocomplete
        disableClearable
        disabled={disabled}
        noOptionsText={"Aucune autre option disponible"}
        size="small"
        value={getCurrentValue()}
        options={options}
        onChange={onChange}
        filterOptions={filterOptions}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, value) => {
          if (searchByCodeAndLabel) {
            return option.label === (value?.label || value);
          }
          return option === value;
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="filled"
            hiddenLabel
            error={!field && showErrors}
            placeholder={
              searchByCodeAndLabel
                ? "Tapez le numéro ou le nom du département"
                : undefined
            }
          />
        )}
      />
    </Box>
  );
}
