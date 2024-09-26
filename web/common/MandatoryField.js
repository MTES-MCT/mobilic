import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { MandatorySuffix } from "./forms/MandatorySuffix";

const useStyles = makeStyles(theme => ({
  text: {
    color: theme.palette.grey[700],
    fontSize: "0.875rem"
  }
}));

export const MandatoryField = () => {
  const classes = useStyles();
  return (
    <Typography marginBottom={2} textAlign="left" className={classes.text}>
      <MandatorySuffix /> Informations obligatoires
    </Typography>
  );
};
