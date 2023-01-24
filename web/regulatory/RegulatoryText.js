import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles(theme => ({
  infoText: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.grey[500],
    fontStyle: "italic"
  }
}));

export function RegulatoryTextDayBeforeAndAfter() {
  const classes = useStyles();

  return (
    <Typography className={classes.infoText} variant="body2">
      Les seuils affichés prennent en compte le temps de travail du jour suivant
      et du jour précédent.
    </Typography>
  );
}

export function RegulatoryTextWeekBeforeAndAfter() {
  const classes = useStyles();

  return (
    <Typography className={classes.infoText} variant="body2">
      Les seuils hebdomadaires prennent en compte le temps de travail de la
      semaine complète.
    </Typography>
  );
}

export function RegulatoryTextNotCalculatedYet() {
  const classes = useStyles();
  return (
    <Typography className={classes.infoText} variant="body2">
      Les seuils réglementaires ne sont pas encore calculés. Ils apparaîtront
      suite à la validation du salarié.
    </Typography>
  );
}
