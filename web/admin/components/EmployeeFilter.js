import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { formatPersonName } from "common/utils/coworkers";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import orderBy from "lodash/orderBy";
import { useFilter } from "../utils/filter";

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
  const [selectedUsers, handleChange] = useFilter(users, setUsers);

  return (
    <Autocomplete
      multiple={multiple}
      id="employee-filter"
      options={orderBy(users, ["firstName", "lastName"], ["asc", "asc"])}
      limitTags={1}
      size="small"
      disableCloseOnSelect
      getOptionLabel={option => formatPersonName(option)}
      renderOption={option => (
        <>
          {multiple && (
            <Checkbox
              style={{ marginRight: 8 }}
              checked={option.selected || false}
            />
          )}
          <span>{formatPersonName(option)}</span>
        </>
      )}
      value={selectedUsers}
      onChange={handleSelect || handleChange}
      renderInput={params => (
        <TextField
          className={classes.formControl}
          {...params}
          variant="outlined"
          label={`Employé${multiple ? "s" : ""}`}
          placeholder={`${
            multiple ? "Filtrer les employés" : "Sélectionner un employé"
          }`}
        />
      )}
    />
  );
}
