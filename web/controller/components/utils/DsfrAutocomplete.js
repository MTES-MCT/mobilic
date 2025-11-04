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
  searchByCodeAndLabel = false // Nouveau prop pour activer la recherche par code et label
}) {
  // Filtre personnalisé pour rechercher par code OU par label
  const filterOptions = createFilterOptions({
    matchFrom: "start",
    stringify: searchByCodeAndLabel
      ? option => `${option.code} ${option.label}`
      : undefined
  });

  // Fonction pour afficher les options avec code + label si activé
  const getOptionLabel = option => {
    if (typeof option === "string") {
      // Si c'est une chaîne (valeur sélectionnée), chercher l'objet correspondant pour affichage
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

  // Trouver l'option correspondante pour la valeur actuelle
  const getCurrentValue = () => {
    if (!field) return null;

    if (searchByCodeAndLabel) {
      return options.find(opt => opt.label === field) || null;
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
