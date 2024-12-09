import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { FieldTitle } from "../../../common/typography/FieldTitle";

const useStyles = makeStyles(() => ({
  fieldName: {
    fontSize: "2rem"
  }
}));

export function ControllerControlEmployeeInfo({ name }) {
  const classes = useStyles();

  return (
    <div>
      <FieldTitle component="h6" className={classes.fieldName}>
        Salarié(e)
      </FieldTitle>
      <Typography variant="h4" component="p">
        {name}
      </Typography>
    </div>
  );
}
