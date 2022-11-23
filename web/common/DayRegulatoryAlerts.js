import Typography from "@mui/material/Typography";
import React from "react";
import { makeStyles } from "@mui/styles";
import { RULE_RESPECT_STATUS } from "common/utils/regulation/rules";
import { RegulationCheck } from "../pwa/components/RegulationCheck";

const useStyles = makeStyles(theme => ({
  infoText: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.grey[500],
    fontStyle: "italic"
  }
}));

const renderRegulationCheck = regulationCheck => (
  <RegulationCheck
    key={regulationCheck.type}
    check={{
      status: regulationCheck.alert
        ? RULE_RESPECT_STATUS.failure
        : RULE_RESPECT_STATUS.success,
      rule: regulationCheck.type,
      extra: regulationCheck.alert?.extra
    }}
  />
);

export function DayRegulatoryAlerts({ regulationComputation }) {
  const classes = useStyles();

  return regulationComputation ? (
    <>
      <Typography className={classes.infoText} variant="body2">
        Les seuils affichés prennent en compte le temps de travail du jour
        suivant et du jour précédent.
      </Typography>
      {regulationComputation.regulationChecks?.map(regulationCheck =>
        renderRegulationCheck(regulationCheck)
      )}
      {/* <Chip className={classes.chip} label="Travail de nuit" /> */}
    </>
  ) : (
    <Typography className={classes.infoText} variant="body2">
      Les seuils réglementaires ne sont pas encore calculés. Ils apparaîtront
      suite à la validation du salarié.
    </Typography>
  );
}
