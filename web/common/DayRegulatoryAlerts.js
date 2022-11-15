import Typography from "@mui/material/Typography";
import React from "react";
import { makeStyles } from "@mui/styles";
import { RULE_RESPECT_STATUS } from "common/utils/regulation/rules";
import { ALERT_TYPES } from "common/utils/regulation//alertTypes";
import { RegulationCheck } from "../pwa/components/RegulationCheck";

const useStyles = makeStyles(theme => ({
  infoText: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.grey[500],
    fontStyle: "italic"
  }
}));

export function DayRegulatoryAlerts({ regulationComputation }) {
  const classes = useStyles();

  const regulationCheck = alertType => {
    const a = regulationComputation.alerts?.find(
      a => a.check.type === alertType
    );
    return (
      <RegulationCheck
        key={alertType}
        check={{
          status: a ? RULE_RESPECT_STATUS.failure : RULE_RESPECT_STATUS.success,
          rule: alertType,
          extra: a ? a.extra : null
        }}
      />
    );
  };

  return regulationComputation ? (
    <>
      <Typography className={classes.infoText} variant="body2">
        Les seuils affichés prennent en compte le temps de travail du jour
        suivant et du jour précédent.
      </Typography>
      {/* <Chip className={classes.chip} label="Travail de nuit" /> */}
      {regulationCheck(ALERT_TYPES.minimumDailyRest)}
      {regulationCheck(ALERT_TYPES.maximumWorkDayTime)}
      {regulationCheck(ALERT_TYPES.minimumWorkDayBreak)}
      {regulationCheck(ALERT_TYPES.maximumUninterruptedWorkTime)}
    </>
  ) : (
    <Typography className={classes.infoText} variant="body2">
      Les seuils réglementaires ne sont pas encore calculés. Ils apparaîtront
      site à la validation du salarié.
    </Typography>
  );
}
