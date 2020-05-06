import React from "react";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme =>({
  cta: {
    backgroundColor: theme.palette.primary.dark,
    '&:hover': {
      backgroundColor: theme.palette.primary.main
    }
  }
}));

export function MainCtaButton (props) {
  const classes = useStyles();
  return (
    <Button
      className={classes.cta}
      variant="contained"
      color="primary"
      {...props}
    >
      {props.children}
    </Button>
  )
}
