import React from "react";
import Container from "@material-ui/core/Container";
import { ACTIVITIES } from "common/utils/activities";
import { getTime } from "common/utils/events";
import { formatTimer } from "common/utils/time";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { AccountButton } from "./AccountButton";
import Box from "@material-ui/core/Box";
import useTheme from "@material-ui/core/styles/useTheme";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const useStyles = makeStyles(theme => ({
  accountButtonContainer: {
    width: "100%",
    textAlign: "left",
    paddingBottom: theme.spacing(5)
  },
  overview: {
    backgroundColor: theme.palette.primary.light,
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

export function CurrentActivityOverview({ currentActivity, currentDayStart }) {
  const store = useStoreSyncedWithLocalStorage();
  const classes = useStyles();
  const now = Date.now();
  const theme = useTheme();

  const currentActivityDuration = now - getTime(currentActivity);
  let activityOverviewText;
  if (currentActivity.type === ACTIVITIES.drive.name) {
    if (
      !currentActivity.driver ||
      currentActivity.driver.id === store.userId()
    ) {
      activityOverviewText = "Vous conduisez depuis";
    } else {
      activityOverviewText = `${currentActivity.driver.firstName} conduit depuis`;
    }
  } else if (currentActivity.type === ACTIVITIES.work.name) {
    activityOverviewText = "Autre tâche commencée depuis";
  } else if (currentActivity.type === ACTIVITIES.break.name) {
    activityOverviewText = "Vous êtes en pause depuis";
  }
  activityOverviewText = `${activityOverviewText} ${formatTimer(
    currentActivityDuration
  )}`;

  const missionOverviewText = `Journée débutée depuis ${formatTimer(
    now - currentDayStart
  )}`;

  return (
    <Box p={2} pb={5} className={classes.overview}>
      <Box className={classes.accountButtonContainer}>
        <AccountButton backgroundColor={theme.palette.primary.light} />
      </Box>
      <Container
        className={classes.textContainer}
        disableGutters
        maxWidth={false}
      >
        <Typography className="hidden" variant="h2">
          abcdefghijklmnopqrstuvwxyz conduit depuis 00h 00m
        </Typography>
        <Typography variant="h2" className={classes.primaryText}>
          {activityOverviewText}
        </Typography>
        <Typography variant="body2" className={classes.secondaryText}>
          {missionOverviewText}
        </Typography>
      </Container>
    </Box>
  );
}
