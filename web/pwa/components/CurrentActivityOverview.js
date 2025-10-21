import React from "react";
import { ACTIVITIES, getActivityStartTimeToUse } from "common/utils/activities";
import { formatTimer, formatTimerWithSeconds, now } from "common/utils/time";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stack } from "@mui/material";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  overview: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  primaryText: {
    color: theme.palette.primary.contrastText
  },
  controlButton: {
    color: theme.palette.primary.contrastText,
    boxShadow: `inset 0 0 0 1px ${theme.palette.primary.contrastText}`,
    "&:hover": {
      color: theme.palette.primary.main
    }
  }
}));

export function CurrentActivityOverview({
  latestActivity,
  currentDayStart,
  currentMission
}) {
  const [_now, setNow] = React.useState(now());
  const classes = useStyles();
  const modals = useModals();

  const store = useStoreSyncedWithLocalStorage();
  const latestActivitySwitchExactTime =
    store.state.latestActivitySwitchExactTime;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentActivityDuration = Math.max(
    _now -
      getActivityStartTimeToUse(latestActivity, latestActivitySwitchExactTime),
    0
  );
  let activityOverviewText;
  if (latestActivity.endTime) {
    activityOverviewText = "Vous êtes en pause depuis";
  } else if (latestActivity.type === ACTIVITIES.drive.name) {
    activityOverviewText = "Vous conduisez depuis";
  } else if (latestActivity.type === ACTIVITIES.support.name) {
    activityOverviewText = "Vous êtes en accompagnement depuis";
  } else if (latestActivity.type === ACTIVITIES.work.name) {
    activityOverviewText = "Autre tâche commencée depuis";
  }

  activityOverviewText = `${activityOverviewText} ${(currentActivityDuration >
    300
    ? formatTimer
    : formatTimerWithSeconds)(currentActivityDuration)}`;

  let missionOverviewText = `Mission ${currentMission.name} démarrée `;

  if (currentMission.submittedBySomeoneElse) {
    missionOverviewText =
      missionOverviewText + `par ${currentMission.submitter.firstName} `;
  }

  missionOverviewText =
    missionOverviewText + `depuis ${formatTimer(_now - currentDayStart)}`;

  return (
    <>
      <Box p={2} pb={5} className={classes.overview}>
        <Box display="flex" justifyContent="flex-end" mb={4}>
          <Button
            priority="secondary"
            size="sm"
            iconPosition="right"
            iconId="fr-icon-qr-code-fill"
            className={classes.controlButton}
            onClick={() => {
              modals.open("userReadQRCode");
            }}
          >
            Accès contrôleurs
          </Button>
        </Box>
        <Stack direction="column" textAlign="center" rowGap={2}>
          <Typography
            className={classes.primaryText}
            variant="h4"
            component="h1"
            ariaLive="off"
          >
            {activityOverviewText}
          </Typography>
          <Typography>{missionOverviewText}</Typography>
        </Stack>
      </Box>
    </>
  );
}
