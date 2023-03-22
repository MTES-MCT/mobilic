import React from "react";
import { makeStyles } from "@mui/styles";
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

export function TeamFilter({
  teams,
  setTeams,
  multiple = true,
  handleSelect = null,
  orderByProperty = "name"
}) {
  const classes = useStyles();

  const handleChange = (event, value) => {
    const selectedIds = multiple ? value.map(u => u.id) : [value.id];
    setTeams(
      teams.map(u => ({
        ...u,
        selected: selectedIds.includes(u.id)
      }))
    );
  };

  const selectedTeams = teams.filter(team => team.selected);
  return (
    <Autocomplete
      multiple={multiple}
      id="team-filter"
      options={orderBy(teams, [orderByProperty])}
      limitTags={1}
      size="small"
      disableCloseOnSelect
      getOptionLabel={option => option.name}
      renderOption={(props, option) => (
        <li {...props}>
          {multiple && (
            <Checkbox
              color="secondary"
              style={{ marginRight: 8 }}
              checked={option.selected || false}
            />
          )}
          <span>{option.name}</span>
        </li>
      )}
      value={selectedTeams}
      onChange={handleSelect || handleChange}
      renderInput={params => (
        <TextField
          className={classes.formControl}
          {...params}
          placeholder={`${
            multiple
              ? selectedTeams.length === 0
                ? "Tous les groupes"
                : ""
              : "Sélectionner un groupe"
          }`}
        />
      )}
    />
  );
}
