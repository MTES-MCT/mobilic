import React from "react";
import Container from "@material-ui/core/Container";
import { ACTIVITIES } from "common/utils/activities";
import { getActivityStartTimeToUse } from "common/utils/events";
import { formatTimer, formatTimerWithSeconds, now } from "common/utils/time";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { AccountButton } from "./AccountButton";
import Box from "@material-ui/core/Box";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const useStyles = makeStyles(theme => ({
  accountButtonContainer: {
    width: "100%",
    textAlign: "left",
    paddingBottom: theme.spacing(5)
  },
  overview: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  secondaryText: {
    paddingTop: theme.spacing(1)
  },
  textContainer: {
    position: "relative"
  },
  primaryText: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0
  }
}));

export function CurrentActivityOverview({
  latestActivity,
  currentDayStart,
  currentMission
}) {
  const [_now, setNow] = React.useState(now());
  const classes = useStyles();

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

  let missionOverviewText = `Mission ${currentMission.name ||
    "sans nom"} démarrée `;

  if (currentMission.submittedBySomeoneElse) {
    missionOverviewText =
      missionOverviewText + `par ${currentMission.submitter.firstName} `;
  }

  missionOverviewText =
    missionOverviewText + `depuis ${formatTimer(_now - currentDayStart)}`;

  return (
    <Box p={2} pb={5} className={classes.overview}>
      <Box className={classes.accountButtonContainer}>
        <AccountButton darkBackground />
      </Box>
      <Container
        className={classes.textContainer}
        disableGutters
        maxWidth={false}
      >
        <Typography className="hidden" variant="h2">
          Vous êtes en accompagnement depuis 00h 00m00
        </Typography>
        <Typography variant="h2" className={classes.primaryText}>
          {activityOverviewText}
        </Typography>
        <Typography className={classes.secondaryText}>
          {missionOverviewText}
        </Typography>
      </Container>
    </Box>
  );
}
