import React from "react";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { ACTIVITIES, SWITCH_ACTIVITIES } from "common/utils/activities";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import { MainCtaButton } from "./MainCtaButton";
import { now } from "common/utils/time";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

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
    backgroundColor:
      props.colored && !props.disabled
        ? props.color
        : theme.palette.background.paper,
    color: props.disabled
      ? theme.palette.grey[500]
      : props.colored
      ? theme.palette.primary.contrastText
      : props.color,
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
    margin: theme.spacing(2),
    flexGrow: 1,
    flexShrink: 1,
    width: "auto",
    height: "auto"
  },
  cardText: props => ({
    width: "100%",
    flexShrink: 0,
    fontSize: "75%",
    fontWeight: props.highlighted ? "bold" : "normal"
  })
}));

export function ActivitySwitchCard({
  label,
  renderIcon,
  colored,
  highlighted,
  disabled,
  onClick,
  color
}) {
  const classes = useStyles({ colored, highlighted, disabled, color });
  return (
    <Card className={classes.card} onClick={!disabled ? onClick : null} raised>
      <Box className={`${classes.cardContent} flex-column-space-between`}>
        {renderIcon({
          className: classes.cardIcon,
          fontSize: "large"
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
  latestActivity,
  disableBreak,
  endMission,
  company,
  requireVehicle = false,
  pushActivitySwitchEvent,
  shouldWaitForClickHandler = false
}) {
  const store = useStoreSyncedWithLocalStorage();
  const classes = useStyles();
  const modals = useModals();
  const allowSupportActivity =
    !company || !company.settings || company.settings.requireSupportActivity;
  const handleActivitySwitch = activityName => () => {
    if (
      latestActivity &&
      activityName ===
        (latestActivity.endTime
          ? ACTIVITIES.break.name
          : latestActivity.type) &&
      ((activityName !== ACTIVITIES.drive.name &&
        activityName !== ACTIVITIES.support.name) ||
        (!allowSupportActivity && team.length <= 1))
    )
      return;
    else if (
      (activityName === ACTIVITIES.drive.name ||
        activityName === ACTIVITIES.support.name) &&
      (requireVehicle || allowSupportActivity || team.length > 1)
    ) {
      modals.open("driverSelection", {
        team,
        requireVehicle: requireVehicle,
        company,
        currentDriverId:
          latestActivity &&
          !latestActivity.endTime &&
          latestActivity.type === ACTIVITIES.drive.name
            ? store.userId()
            : undefined,
        currentDriverStartTime: latestActivity
          ? latestActivity.startTime
          : null,
        handleDriverSelection: async (driverId, vehicle, kilometerReading) => {
          store.setState({ latestActivitySwitchExactTime: now() });
          shouldWaitForClickHandler
            ? await pushActivitySwitchEvent(
                activityName,
                driverId,
                vehicle,
                kilometerReading
              )
            : pushActivitySwitchEvent(
                activityName,
                driverId,
                vehicle,
                kilometerReading
              );
        }
      });
    } else {
      store.setState({ latestActivitySwitchExactTime: now() });
      pushActivitySwitchEvent(activityName);
    }
  };

  return (
    <Box className={classes.container} p={2}>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems={"center"}
        spacing={2}
      >
        {Object.values(SWITCH_ACTIVITIES).map(activity => {
          const current =
            latestActivity &&
            (!latestActivity.endTime
              ? activity.name === latestActivity.type ||
                (activity === ACTIVITIES.drive &&
                  latestActivity.type === ACTIVITIES.support.name)
              : activity === ACTIVITIES.break);
          return (
            <Grid
              item
              className={classes.gridItem}
              xs
              key={activity.name}
              style={{ marginBottom: current ? 16 : 0, lineHeight: 0 }}
            >
              <ArrowDropUpIcon
                viewBox="0 8 24 8"
                style={{
                  color: activity.color,
                  visibility: current ? "visible" : "hidden",
                  width: 24,
                  height: 8
                }}
              />
              <ActivitySwitchCard
                label={activity.label}
                renderIcon={activity.renderIcon}
                colored={current || !latestActivity}
                highlighted={current}
                onClick={handleActivitySwitch(activity.name)}
                disabled={
                  disableBreak && activity.name === ACTIVITIES.break.name
                }
                color={activity.color}
              />
            </Grid>
          );
        })}
      </Grid>
      {endMission && (
        <Box pt={6} pb={2}>
          <MainCtaButton onClick={() => endMission(now())}>
            Mission terminée
          </MainCtaButton>
        </Box>
      )}
    </Box>
  );
}
