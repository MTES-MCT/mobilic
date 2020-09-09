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
    color: props.disabled
      ? theme.palette.grey[500]
      : props.current
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
    cursor: props.disabled ? "inherit" : "pointer"
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

export function ActivitySwitchCard({
  label,
  renderIcon,
  current,
  disabled,
  onClick
}) {
  const classes = useStyles({ current, disabled });
  return (
    <Card className={classes.card} onClick={!disabled ? onClick : null} raised>
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
  disableBreak,
  endMission,
  pushActivitySwitchEvent
}) {
  const store = useStoreSyncedWithLocalStorage();
  const classes = useStyles();
  const modals = useModals();
  const handleActivitySwitch = activityName => () => {
    if (
      currentActivity &&
      activityName === currentActivity.type &&
      activityName !== ACTIVITIES.drive.name &&
      activityName !== ACTIVITIES.support.name
    )
      return;
    else if (
      activityName === ACTIVITIES.drive.name ||
      activityName === ACTIVITIES.support.name
    ) {
      modals.open("driverSelection", {
        team,
        currentDriverId:
          currentActivity && currentActivity.type === ACTIVITIES.drive.name
            ? store.userId()
            : undefined,
        currentDriverStartTime: currentActivity
          ? getTime(currentActivity)
          : null,
        handleDriverSelection: driverId =>
          pushActivitySwitchEvent(activityName, driverId)
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
                currentActivity &&
                (activity.name === currentActivity.type ||
                  (activity === ACTIVITIES.drive &&
                    currentActivity.type === ACTIVITIES.support.name))
              }
              onClick={handleActivitySwitch(activity.name)}
              disabled={disableBreak && activity.name === ACTIVITIES.break.name}
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
                handleMissionEnd: async (expenditures, comment) =>
                  await endMission({
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
