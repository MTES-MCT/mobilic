import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { FaqCard } from "./FaqCard";

const useStyles = makeStyles(theme => ({
  rule: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export function RegulationCard({ rule, onClick }) {
  const classes = useStyles();

  return (
    <FaqCard
      question={rule.name}
      answer={<Typography className={classes.rule}>{rule.rule}</Typography>}
      onClick={onClick}
    />
  );
}
