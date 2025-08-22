import React from "react";
import { makeStyles } from "@mui/styles";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import orderBy from "lodash/orderBy";

const useStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 200
  },
  noLabel: {
    marginTop: theme.spacing(3)
  }
}));

export function MultipleValuesFilter({
  values,
  setValues,
  fieldLabel,
  optionLabel,
  orderFields
}) {
  const classes = useStyles();

  const handleChange = (event, value) => {
    const selectedIds = value.map(u => u.id);
    setValues(
      values.map(u => ({
        ...u,
        selected: selectedIds.includes(u.id)
      }))
    );
  };

  const selectedValues = values.filter(user => user.selected);
  return (
    <Autocomplete
      noOptionsText={"Aucune option disponible"}
      multiple
      disableCloseOnSelect
      options={orderBy(values, orderFields)}
      limitTags={5}
      getOptionLabel={optionLabel}
      renderOption={(props, option) => (
        <li {...props}>
          <Checkbox
            color="primary"
            style={{ marginRight: 8 }}
            checked={option.selected || false}
          />
          <span>{optionLabel(option)}</span>
        </li>
      )}
      value={selectedValues}
      onChange={handleChange}
      renderInput={params => (
        <TextField
          fullWidth
          label={fieldLabel}
          className={classes.formControl}
          {...params}
        />
      )}
    />
  );
}
