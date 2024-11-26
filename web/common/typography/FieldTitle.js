import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Typography from "@mui/material/Typography";
import React from "react";
import { useTypographyStyles } from "./TypographyStyles";

export const FieldTitle = ({
  uppercaseTitle = false,
  className = {},
  children,
  ...otherProps
}) => {
  const classes = useTypographyStyles({ uppercaseTitle });
  return (
    <Typography
      align="left"
      variant={uppercaseTitle ? "overline" : "subtitle1"}
      className={cx(classes.fieldName, className)}
      {...otherProps}
    >
      {children}
    </Typography>
  );
};
