import Typography from "@mui/material/Typography";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import React from "react";
import Box from "@mui/material/Box";
import { createFilterOptions } from "@mui/material/Autocomplete";

export function DsfrAutocomplete({
  field,
  fieldLabel,
  disabled,
  onChange,
  showErrors,
  options
}) {
  const filterOptions = createFilterOptions({
    matchFrom: "start"
  });
  return (
    <Box mb={"1.5rem"}>
      <Typography
        mb={0.5}
        className={!field && showErrors ? "fr-label--error" : "fr-label"}
      >
        {fieldLabel} {<sup style={{ color: "red" }}>*</sup>}
      </Typography>
      <Autocomplete
        disableClearable
        disabled={disabled}
        noOptionsText={"Aucune autre option disponible"}
        size="small"
        value={field || ""}
        options={options}
        onChange={onChange}
        filterOptions={filterOptions}
        renderInput={params => (
          <TextField
            {...params}
            variant="filled"
            hiddenLabel
            error={!field && showErrors}
          />
        )}
      />
    </Box>
  );
}
