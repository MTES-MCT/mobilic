import React from "react";
import { makeStyles } from "@mui/styles";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import orderBy from "lodash/orderBy";
import { formatPersonName } from "common/utils/coworkers";

const useStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 200
  },
  noLabel: {
    marginTop: theme.spacing(3)
  }
}));

export function TeamEmployeesFilter({ values, setValues, fieldLabel }) {
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
      multiple
      disableCloseOnSelect
      options={orderBy(
        values,
        ["detached", "firstName", "lastName"],
        ["asc", "asc", "asc"]
      )}
      limitTags={5}
      getOptionLabel={option => formatPersonName(option)}
      groupBy={option => option.detached}
      renderOption={(props, option) => (
        <li {...props}>
          <Checkbox
            color="secondary"
            style={{ marginRight: 8 }}
            checked={option.selected || false}
          />
          <span>{formatPersonName(option)}</span>
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
