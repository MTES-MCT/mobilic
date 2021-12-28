import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { FaqCard } from "./FaqCard";
import { useRegulationDrawer } from "./RegulationDrawer";

const useStyles = makeStyles(theme => ({
  rule: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export function RegulationCard({ rule }) {
  const classes = useStyles();

  const openRegulationDrawer = useRegulationDrawer();

  return (
    <FaqCard
      question={rule.name}
      answer={rule.rule}
      answerClassName={classes.rule}
      onClick={() => openRegulationDrawer(rule, false)}
    />
  );
}
