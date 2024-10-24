import Badge from "@mui/material/Badge";
import React from "react";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  customBadge: {
    right: theme.spacing(-16)
  },
  success: {
    backgroundColor: theme.palette.success.main
  }
}));
export function TextWithBadge({ children, ...props }) {
  const classes = useStyles();

  return (
    <Badge
      {...props}
      classes={{
        badge: `${classes.customBadge} ${
          props.color === "success" ? classes.success : ""
        }`
      }}
    >
      {children}
    </Badge>
  );
}
