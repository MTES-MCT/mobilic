import React from "react";
import FormGroup from "@material-ui/core/FormGroup/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
            color="primary"
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
