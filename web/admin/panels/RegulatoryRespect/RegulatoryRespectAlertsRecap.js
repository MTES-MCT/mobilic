import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { fr } from "@codegouvfr/react-dsfr";
import { useRegulatoryAlertsSummaryContext } from "../../utils/contextRegulatoryAlertsSummary";
import { ExternalLink } from "../../../common/ExternalLink";
import classNames from "classnames";
import { useDayDrawer } from "../../drawers/DayDrawer";
import { useAdminStore } from "../../store/store";
import { aggregateWorkDayPeriods } from "../../utils/workDays";
import { getPrettyDateByperiod } from "common/utils/time";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { ADMIN_QUERY_USER_WORK_DAY } from "common/utils/apiQueries/admin";
import { useApi } from "common/utils/api";

const PRETTY_LABELS = {
  maximumWorkedDaysInWeek: "Repos hebdomadaire",
  maximumWorkInCalendarWeek: "Durée du travail hebdomadaire",
  minimumDailyRest: "Repos journalier",
  not_enough_break: "Temps de pause",
  too_much_uninterrupted_work_time: "Durée maximale de travail ininterrompu",
  maximumWorkDayTime: "Durée du travail quotidien"
};

const useStyles = makeStyles((theme) => ({
  title: {
    color: fr.colors.decisions.text.actionHigh.grey.default,
    fontSize: "1.25rem",
    fontWeight: 700
  },
  description: {
    fontSize: "0.875rem",
    color: fr.colors.decisions.text.mention.grey.default
  },
  linkButton: {
    textDecoration: "underline",
    textUnderlineOffset: "6px"
  }
}));

const DisplayAlerts = (alerts, onClickDay) => {
  const classes = useStyles();
  return (
    <Stack mt={2}>
      {alerts
        .filter((alerts) => alerts.alertsType in PRETTY_LABELS)
        .map((alerts) => (
          <Box
            key={`alerts__${alerts.alertsType}`}
            className={classNames("alerts-summary", {
              expandable: alerts.days && alerts.days.length > 0
            })}
          >
            <Accordion
              label={
                <Stack
                  sx={{ width: "100%" }}
                  direction="row"
                  justifyContent="space-between"
                  pr={1}
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
            >
              {alerts.days && alerts.days.length > 0 && (
                <Stack direction="column" rowGap={1}>
                  {alerts.days.map((day) => (
                    <Button
                      key={`alert__${day}`}
                      priority="tertiary no outline"
                      onClick={() => onClickDay(day)}
                      size="small"
                      iconId="fr-icon-arrow-right-line"
                      iconPosition="right"
                      className={classes.linkButton}
                    >
                      Journée du {getPrettyDateByperiod(new Date(day), "day")}
                    </Button>
                  ))}
                </Stack>
              )}
            </Accordion>
          </Box>
        ))}
    </Stack>
  );
};

export const AlertsRecap = ({ ...otherProps }) => {
  const classes = useStyles();
  const api = useApi();
  const { openWorkday } = useDayDrawer();
  const { summary, uniqueUserId } = useRegulatoryAlertsSummaryContext();
  const adminStore = useAdminStore();
  const onClickDay = async (day) => {
    let workTimeEntries = adminStore.workDays
      .filter((wd) => wd.day === day)
      .filter((wd) => wd.user.id === uniqueUserId);

    if (workTimeEntries.length === 0) {
      const resPayload = await api.graphQlQuery(ADMIN_QUERY_USER_WORK_DAY, {
        adminId: adminStore.userId,
        day,
        userId: uniqueUserId,
        companyId: adminStore.companyId
      });
      workTimeEntries = [
        resPayload.data.user.adminedCompanies[0].workDays.edges[0].node
      ];
    }

    const aggregates = aggregateWorkDayPeriods(workTimeEntries, "day");

    if (aggregates.length > 0) {
      openWorkday(aggregates[0]);
    }
  };
  return (
    <Stack {...otherProps} rowGap={3}>
      <Stack rowGap={1}>
        <Typography className={classes.title}>
          Respects des seuils journaliers
        </Typography>
        <Typography className={classes.description}>
          Dépliez les seuils pour afficher les missions concernées par les
          dépassements.
        </Typography>
        {DisplayAlerts(summary.dailyAlerts, onClickDay)}
      </Stack>
      <Stack rowGap={1}>
        <Typography className={classes.title}>
          Respect des seuils hebdomadaires
        </Typography>
        {DisplayAlerts(summary.weeklyAlerts)}
      </Stack>
      <ExternalLink
        url="/resources/home"
        text="En savoir plus sur les seuils à respecter par secteur d’activité"
        withIcon
      />
    </Stack>
  );
};
