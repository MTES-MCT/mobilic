import React, { useMemo } from "react";
import { makeStyles } from "@mui/styles";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import orderBy from "lodash/orderBy";
import PropTypes from "prop-types";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: 200,
    maxWidth: 500
  },
  dsfrInput: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: fr.colors.decisions.background.contrastRaised.grey.default,
      borderBottom: `2px solid ${fr.colors.decisions.border.plain.grey.default}`,
      borderRadius: "4px 4px 0 0"
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none"
    }
  }
}));

TeamFilter.propTypes = {
  teams: PropTypes.array,
  setTeams: PropTypes.func,
  multiple: PropTypes.bool,
  handleSelect: PropTypes.func,
  orderByProperty: PropTypes.oneOf(["name", "rankName"]),
  size: PropTypes.oneOf(["small", "medium"])
};

export function TeamFilter({
  teams,
  setTeams,
  multiple = true,
  handleSelect = null,
  orderByProperty = "name",
  size = "small",
  ...otherProps
}) {
  const classes = useStyles();

  const handleChange = (event, value) => {
    const selectedIds = multiple
      ? value.map((u) => u.id)
      : value
        ? [value.id]
        : [];
    setTeams(
      teams.map((u) => ({
        ...u,
        selected: selectedIds.includes(u.id)
      }))
    );
  };

  const selectedTeams = teams.filter((team) => team.selected);

  const value = useMemo(() => {
    if (multiple) {
      return selectedTeams;
    } else {
      return selectedTeams?.length > 0 ? selectedTeams[0] : null;
    }
  }, [selectedTeams, multiple]);

  return (
    <Autocomplete
      className={classes.dsfrInput}
      multiple={multiple}
      id="team-filter"
      options={orderBy(teams, [orderByProperty])}
      limitTags={1}
      size={size}
      disableCloseOnSelect={multiple}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <li {...props}>
          {multiple && (
            <Checkbox
              color="primary"
              style={{ marginRight: 8 }}
              checked={option.selected || false}
            />
          )}
          <span>{option.name}</span>
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
              ? selectedTeams.length === 0
                ? "Tous les groupes"
                : ""
              : "Tous les groupes"
          }`}
        />
      )}
      {...otherProps}
    />
  );
}
