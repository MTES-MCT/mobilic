import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";

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
