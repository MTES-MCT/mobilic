import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TimerIcon from "@material-ui/icons/Timer";
import { formatTimer } from "common/utils/time";
import classNames from "classnames";
import { ACTIVITIES } from "common/utils/activities";
import useTheme from "@material-ui/core/styles/useTheme";
import { useModals } from "common/utils/modals";
import { getTime } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

export function ActivitySwitchCard({
  label,
  baseColor,
  renderIcon,
  timer,
  onFocus,
  onClick,
  className
}) {
  const theme = useTheme();
  const color = onFocus
    ? theme.palette.primary.main
    : baseColor
    ? baseColor
    : "inherit";
  const timerProps = {
    className: classNames("activity-card-timer", {
      bold: onFocus,
      hidden: !timer
    }),
    style: { color: color }
  };
  return (
    <Card
      className={className}
      onClick={onClick}
      raised={onFocus}
      style={{ border: onFocus ? `${color} groove 2px` : "none" }}
    >
      <CardContent className="activity-card-content">
        {label && (
          <Typography
            variant="body2"
            className={classNames("activity-card-title", {
              bold: onFocus
            })}
            style={{ color: color }}
            noWrap
            gutterBottom
          >
            {label}
          </Typography>
        )}
        {renderIcon({
          className: "activity-card-icon",
          style: { color: color }
        })}
        <div className="flex-row-center">
          {onFocus && <TimerIcon fontSize="inherit" {...timerProps} />}
          <div style={{ width: "1vw" }} />
          <Typography variant="body2" {...timerProps}>
            {formatTimer(timer || 10)}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivitySwitchGrid({
  timers,
  team,
  currentActivity,
  pushActivitySwitchEvent
}) {
  const modals = useModals();
  const hasTeamMates = team.length > 0;
  const theme = useTheme();
  const store = useStoreSyncedWithLocalStorage();
  const teamWithSelf = [store.userInfo(), ...team];
  const handleActivitySwitch = activityName => () => {
    if (
      activityName === currentActivity.type &&
      (!hasTeamMates || activityName !== ACTIVITIES.drive.name)
    )
      return;
    else if (hasTeamMates && activityName === ACTIVITIES.drive.name) {
      modals.open("driverSelection", {
        team: teamWithSelf,
        currentDriver:
          currentActivity.driverId !== undefined
            ? teamWithSelf.find(tm => tm.id === currentActivity.driverId)
            : undefined,
        currentDriverStartTime: getTime(currentActivity),
        handleDriverSelection: driver =>
          pushActivitySwitchEvent(activityName, driver.id)
      });
    } else if (activityName === ACTIVITIES.rest.name) {
      modals.open("confirmation", {
        handleConfirm: () => pushActivitySwitchEvent(activityName),
        title: "Confirmer fin de journée"
      });
    } else pushActivitySwitchEvent(activityName);
  };

  return (
    <div className="activity-grid-container">
      <Grid
        container
        direction="row"
        justify="center"
        alignItems={"center"}
        spacing={2}
      >
        {Object.values(ACTIVITIES).map(activity => (
          <Grid item key={activity.name}>
            <ActivitySwitchCard
              className="activity-card-container"
              label={activity.label}
              renderIcon={activity.renderIcon}
              timer={timers[activity.name]}
              onFocus={activity.name === currentActivity.type}
              onClick={handleActivitySwitch(activity.name)}
              baseColor={
                activity.name === ACTIVITIES.rest.name &&
                theme.palette[activity.name]
              }
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
