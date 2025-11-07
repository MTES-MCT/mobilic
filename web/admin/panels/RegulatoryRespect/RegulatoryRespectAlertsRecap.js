import React from "react";
import { AccordionDetails, Box, Stack, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import { useRegulatoryAlertsSummaryContext } from "../../utils/contextRegulatoryAlertsSummary";

const PRETTY_LABELS = {
  maximumWorkedDaysInWeek: "Repos hebdomadaire",
  maximumWorkInCalendarWeek: "Durée du travail hebdomadaire",
  minimumDailyRest: "Repos journalier",
  not_enough_break: "Temps de pause",
  too_much_uninterrupted_work_time: "Durée maximale de travail ininterrompu",
  maximumWorkDayTime: "Durée du travail quotidien",
};

const useStyles = makeStyles((theme) => ({
  title: {
    color: fr.colors.decisions.text.actionHigh.grey.default,
    fontSize: "1.25rem",
    fontWeight: 700,
  },
  description: {
    fontSize: "0.875rem",
    color: fr.colors.decisions.text.mention.grey.default,
  },
}));

const displayAlerts = (alerts) => (
  <Stack mt={2}>
    {alerts
      .filter((alerts) => alerts.alertsType in PRETTY_LABELS)
      .map((alerts) => (
        <Box
          style={{
            pointerEvents: "none",
          }}
          className="alerts-summary"
        >
          <Accordion
            label={
              <Stack
                sx={{ width: "100%" }}
                direction="row"
                justifyContent="space-between"
              >
                <Typography>{PRETTY_LABELS[alerts.alertsType]}</Typography>
                <Badge
                  small
                  severity={alerts.nbAlerts === 0 ? "success" : "warning"}
                >
                  {alerts.nbAlerts === 0
                    ? "Seuil respecté"
                    : `${alerts.nbAlerts} dépassements`}
                </Badge>
              </Stack>
            }
          />
        </Box>
      ))}
  </Stack>
);

export const AlertsRecap = ({ ...otherProps }) => {
  const classes = useStyles();
  const { summary } = useRegulatoryAlertsSummaryContext();
  return (
    <Stack {...otherProps} rowGap={4}>
      <Stack rowGap={1}>
        <Typography className={classes.title}>
          Respects des seuils journaliers
        </Typography>
        <Typography className={classes.description}>
          Dépliez les seuils pour afficher les missions concernées par les
          dépassements.
        </Typography>
        {displayAlerts(summary.dailyAlerts)}
      </Stack>
      <Stack rowGap={1}>
        <Typography className={classes.title}>
          Respect des seuils hebdomadaires
        </Typography>
        {displayAlerts(summary.weeklyAlerts)}
      </Stack>
    </Stack>
  );
};
