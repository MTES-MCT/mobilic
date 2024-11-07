import Typography from "@mui/material/Typography";
import React from "react";
import { useTypographyStyles } from "./TypographyStyles";

export const Explanation = ({ children, ...otherProps }) => {
  const classes = useTypographyStyles();
  return (
    <Typography className={classes.explanation} {...otherProps}>
      {children}
    </Typography>
  );
};
