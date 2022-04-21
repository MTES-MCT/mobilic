import React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  inner: {
    alignItems: "flex-start",
    textAlign: "left"
  },
  checkbox: {
    paddingTop: 0
  }
}));

export function CheckboxField({ checked, required, onChange, label }) {
  const classes = useStyles();
  return (
    <FormGroup className={classes.container}>
      <FormControlLabel
        className={classes.inner}
        control={
          <Checkbox
            required={required}
            className={classes.checkbox}
            checked={checked}
            onChange={onChange}
          />
        }
        label={label}
      />
    </FormGroup>
  );
}
