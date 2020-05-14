import React from "react";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import { ACTIVITIES, TIMEABLE_ACTIVITIES } from "common/utils/activities";
import { useModals } from "common/utils/modals";
import { getTime } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";
import { MainCtaButton } from "./MainCtaButton";

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: "24px",
    marginTop: theme.spacing(-3),
    marginBottom: theme.spacing(-3),
    zIndex: 1000,
    flexShrink: 0
  },
  gridItem: {
    maxWidth: 120
  },
  card: props => ({
    backgroundColor: props.current
      ? theme.palette.primary.main
      : theme.palette.background.paper,
    color: props.current
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    cursor: "pointer"
  }),
  cardContent: {
    height: "100%",
    width: "100%",
    maxWidth: 90,
    minHeight: 70,
    maxHeight: 90,
    margin: "auto",
    padding: theme.spacing(0.5)
  },
  cardIcon: {
    margin: theme.spacing(1),
    flexGrow: 1,
    flexShrink: "unset",
    width: "auto",
    height: "auto"
  },
  cardText: props => ({
    width: "100%",
    flexShrink: 0,
    fontWeight: props.current ? "bold" : "normal"
  })
}));

export function ActivitySwitchCard({ label, renderIcon, current, onClick }) {
  const classes = useStyles({ current });
  return (
    <Card className={classes.card} onClick={onClick} raised>
      <Box className={`${classes.cardContent} flex-column-space-between`}>
        {renderIcon({
          className: classes.cardIcon
        })}
        <Typography
          align="center"
          variant="body2"
          className={classes.cardText}
          noWrap
          gutterBottom
        >
          {label}
        </Typography>
      </Box>
    </Card>
  );
}

export function ActivitySwitch({
  team,
  currentActivity,
  endMission,
  pushActivitySwitchEvent
}) {
  const classes = useStyles();
  const modals = useModals();
  const hasTeamMates = team.length > 0;
  const store = useStoreSyncedWithLocalStorage();
  const teamWithSelf = [store.userInfo(), ...team];
  const handleActivitySwitch = activityName => () => {
    if (
      currentActivity &&
      activityName === currentActivity.type &&
      (!hasTeamMates || activityName !== ACTIVITIES.drive.name)
    )
      return;
    else if (hasTeamMates && activityName === ACTIVITIES.drive.name) {
      modals.open("driverSelection", {
        team: teamWithSelf,
        currentDriver: currentActivity ? currentActivity.driver : undefined,
        currentDriverStartTime: currentActivity
          ? getTime(currentActivity)
          : null,
        handleDriverSelection: driver =>
          pushActivitySwitchEvent(activityName, driver)
      });
    } else pushActivitySwitchEvent(activityName);
  };

  return (
    <Box className={classes.container} p={2}>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems={"center"}
        spacing={2}
      >
        {Object.values(TIMEABLE_ACTIVITIES).map(activity => (
          <Grid item className={classes.gridItem} xs key={activity.name}>
            <ActivitySwitchCard
              label={activity.label}
              renderIcon={activity.renderIcon}
              current={
                currentActivity && activity.name === currentActivity.type
              }
              onClick={handleActivitySwitch(activity.name)}
            />
          </Grid>
        ))}
      </Grid>
      {endMission && (
        <Box pt={6} pb={2}>
          <MainCtaButton
            onClick={() => {
              const missionEndTime = Date.now();
              modals.open("endMission", {
                handleMissionEnd: (expenditures, comment) =>
                  endMission({
                    endTime: missionEndTime,
                    expenditures,
                    comment
                  })
              });
            }}
          >
            Mission terminée
          </MainCtaButton>
        </Box>
      )}
    </Box>
  );
}
