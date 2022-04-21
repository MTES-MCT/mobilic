import Badge from "@mui/material/Badge";
import React from "react";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  customBadge: {
    right: theme.spacing(-2)
  },
  success: {
    backgroundColor: theme.palette.success.main
  }
}));
export function TextWithBadge({
  children,
  badgeContent,
  invisible = false,
  color
}) {
  const classes = useStyles();

  return (
    <Badge
      invisible={invisible}
      badgeContent={badgeContent}
      color={color}
      classes={{
        badge: `${classes.customBadge} ${
          color === "success" ? classes.success : ""
        }`
      }}
    >
      {children}
    </Badge>
  );
}
