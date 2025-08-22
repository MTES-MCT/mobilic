import React from "react";
import { makeStyles } from "@mui/styles";
import { formatPersonName } from "common/utils/coworkers";
import { Autocomplete } from "@mui/material";
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
  handleSelect = null,
  showOnlyUserIds = null
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

  const displayedUsers = React.useMemo(
    () =>
      showOnlyUserIds
        ? users.filter(user => showOnlyUserIds.includes(user.id))
        : users,
    [showOnlyUserIds, users]
  );
  return (
    <Autocomplete
      multiple={multiple}
      id="employee-filter"
      options={orderBy(
        displayedUsers,
        ["lastName", "firstName"],
        ["asc", "asc"]
      )}
      limitTags={1}
      size="small"
      disableCloseOnSelect
      getOptionLabel={option => formatPersonName(option, true)}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          {multiple && (
            <Checkbox
              color="primary"
              style={{ marginRight: 8 }}
              checked={option.selected || false}
            />
          )}
          <span>{formatPersonName(option, true)}</span>
        </li>
      )}
      value={selectedUsers}
      onChange={handleSelect || handleChange}
      renderInput={params => (
        <TextField
          className={classes.formControl}
          {...params}
          placeholder={`${
            multiple
              ? selectedUsers.length === 0
                ? "Tous les salariés"
                : ""
              : "Sélectionner un salarié"
          }`}
        />
      )}
    />
  );
}
