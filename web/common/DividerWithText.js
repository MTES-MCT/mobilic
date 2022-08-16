import React from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center"
  },
  border: {
    borderBottom: "1px solid",
    width: "100%"
  },
  content: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2)
  }
}));

export function DividerWithText(props) {
  const classes = useStyles();
  const { children, ...otherProps } = props;

  return (
    <Box {...otherProps}>
      <div className={classes.container}>
        <div className={classes.border} />
        <span className={classes.content}>{children}</span>
        <div className={classes.border} />
      </div>
    </Box>
  );
}
