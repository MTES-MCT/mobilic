import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";

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

export function CompanyFilter({ companies, setCompanies, className }) {
  const classes = useStyles();

  const handleChange = (event, value) => {
    const selectedIds = value.map(c => c.id);
    setCompanies(
      companies.map(c => ({
        ...c,
        selected: selectedIds.includes(c.id)
      }))
    );
  };

  const selectedCompanies = companies.filter(c => c.selected);
  return (
    <Autocomplete
      multiple
      id="company-filter-filter"
      options={companies}
      disableCloseOnSelect
      limitTags={1}
      size="small"
      className={className}
      getOptionLabel={company => company.name}
      renderOption={company => (
        <>
          <Checkbox
            style={{ marginRight: 8 }}
            checked={company.selected || false}
          />
          <span>{company.name}</span>
        </>
      )}
      value={selectedCompanies}
      onChange={handleChange}
      renderInput={params => (
        <TextField
          className={classes.formControl}
          {...params}
          variant="outlined"
          label="Entreprises"
          placeholder="Filtrer les entreprises"
        />
      )}
    />
  );
}
