import React, { useMemo } from "react";
import { formatPersonName } from "common/utils/coworkers";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import orderBy from "lodash/orderBy";
import PropTypes from "prop-types";
import { useDsfrFilterStyles } from "./styles/DsfrFilterStyle";

EmployeeFilter.propTypes = {
  users: PropTypes.array,
  setUsers: PropTypes.func,
  multiple: PropTypes.bool,
  handleSelect: PropTypes.func,
  showOnlyUserIds: PropTypes.array,
  uniqueEmptyLabel: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium"])
};
export function EmployeeFilter({
  users,
  setUsers,
  multiple = true,
  handleSelect = null,
  showOnlyUserIds = null,
  uniqueEmptyLabel = "Sélectionner un salarié",
  size = "small",
  ...otherProps
}) {
  const classes = useDsfrFilterStyles();

  const handleChange = (event, value) => {
    let selectedIds = [];
    if (multiple) {
      selectedIds = value.map((u) => u.id);
    } else {
      selectedIds = value ? [value.id] : [];
    }
    setUsers(
      users.map((u) => ({
        ...u,
        selected: selectedIds.includes(u.id)
      }))
    );
  };

  const selectedUsers = users.filter((user) => user.selected);

  const displayedUsers = React.useMemo(
    () =>
      showOnlyUserIds
        ? users.filter((user) => showOnlyUserIds.includes(user.id))
        : users,
    [showOnlyUserIds, users]
  );

  const value = useMemo(() => {
    if (multiple) {
      return selectedUsers;
    } else {
      return selectedUsers?.length > 0 ? selectedUsers[0] : null;
    }
  }, [selectedUsers, multiple]);

  return (
    <Autocomplete
      className={classes.dsfrInput}
      multiple={multiple}
      id="employee-filter"
      options={orderBy(
        displayedUsers,
        ["lastName", "firstName"],
        ["asc", "asc"]
      )}
      limitTags={1}
      size={size}
      disableCloseOnSelect={multiple}
      getOptionLabel={(option) => formatPersonName(option, true)}
      renderOption={(props, option) => (
        <li {...props} key={option.id} className={`${props.className} ${classes.dsfrOption}`}>
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
      value={value}
      onChange={handleSelect || handleChange}
      renderInput={(params) => (
        <TextField
          className={classes.formControl}
          {...params}
          placeholder={`${
            multiple
              ? selectedUsers.length === 0
                ? "Tous les salariés"
                : ""
              : uniqueEmptyLabel
          }`}
        />
      )}
      disableClearable={
        !multiple && (!selectedUsers || selectedUsers.length === 0)
      }
      {...otherProps}
    />
  );
}
