import Typography from "@mui/material/Typography";
import React from "react";
import { useTypographyStyles } from "./TypographyStyles";

export const Description = ({ children, ...otherProps }) => {
  const classes = useTypographyStyles();
  return (
    <Typography className={classes.description} {...otherProps}>
      {children}
    </Typography>
  );
};
