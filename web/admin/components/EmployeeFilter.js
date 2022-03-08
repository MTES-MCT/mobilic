import React from "react";
import { makeStyles } from "@mui/styles";
import { formatPersonName } from "common/utils/coworkers";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import orderBy from "lodash/orderBy";

const useStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 200,
    maxWidth: 500
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: 2
  },
  noLabel: {
    marginTop: theme.spacing(3)
  }
}));

export function EmployeeFilter({
  users,
  setUsers,
  multiple = true,
  handleSelect = null
}) {
  const classes = useStyles();

  const handleChange = (event, value) => {
    const selectedIds = multiple ? value.map(u => u.id) : [value.id];
    setUsers(
      users.map(u => ({
        ...u,
        selected: selectedIds.includes(u.id)
      }))
    );
  };

  const selectedUsers = users.filter(user => user.selected);
  return (
    <Autocomplete
      multiple={multiple}
      id="employee-filter"
      options={orderBy(users, ["firstName", "lastName"], ["asc", "asc"])}
      limitTags={1}
      size="small"
      disableCloseOnSelect
      getOptionLabel={option => formatPersonName(option)}
      renderOption={(props, option) => (
        <li {...props}>
          {multiple && (
            <Checkbox
              color="secondary"
              style={{ marginRight: 8 }}
              checked={option.selected || false}
            />
          )}
          <span>{formatPersonName(option)}</span>
        </li>
      )}
      value={selectedUsers}
      onChange={handleSelect || handleChange}
      renderInput={params => (
        <TextField
          className={classes.formControl}
          {...params}
          label={`Employé${multiple ? "s" : ""}`}
          placeholder={`${
            multiple ? "Filtrer les employés" : "Sélectionner un employé"
          }`}
        />
      )}
    />
  );
}
