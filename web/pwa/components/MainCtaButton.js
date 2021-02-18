import React from "react";
import omit from "lodash/omit";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { LoadingButton } from "common/components/LoadingButton";

const useStyles = makeStyles(theme => ({
  cta: {
    backgroundColor: theme.palette.primary.dark,
    "&:hover": {
      backgroundColor: theme.palette.primary.main
    }
  }
}));

export function MainCtaButton(props) {
  const classes = useStyles();
  return (
    <LoadingButton
      className={`${classes.cta} ${props.className}`}
      variant="contained"
      color="primary"
      {...omit(props, ["className"])}
    />
  );
}
