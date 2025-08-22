import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { FieldTitle } from "../../../common/typography/FieldTitle";

const useStyles = makeStyles(() => ({
  title: {
    fontSize: "1rem"
  },
  value: {
    fontSize: "1.375rem",
    fontWeight: "700"
  }
}));

export function ControllerControlEmployeeInfo({ name }) {
  const classes = useStyles();

  return (
    <div>
      <FieldTitle component="h6" className={classes.title}>
        Salarié(e)
      </FieldTitle>
      <Typography className={classes.value} mt={1}>
        {name}
      </Typography>
    </div>
  );
}
