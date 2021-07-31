import React from "react";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  warningText: {
    fontStyle: "italic",
    color: theme.palette.warning.main
  }
}));

export function ItalicWarningTypography(props) {
  const classes = useStyles();

  return <Typography className={classes.warningText} {...props} />;
}
