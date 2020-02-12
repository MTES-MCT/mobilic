import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TimerIcon from "@material-ui/icons/Timer";
import { formatTimer } from "../utils/time";
import classNames from "classnames";
import { ACTIVITIES } from "../utils/activities";
import useTheme from "@material-ui/core/styles/useTheme";
import { ModalContext } from "../../app/utils/modals";

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
      "card-on-focus": onFocus,
      hidden: !timer
    }),
    style: { color: color }
  };
  return (
    <Card className={className} onClick={onClick} raised={onFocus}>
      <CardContent className="activity-card-content">
        {label && (
          <Typography
            variant="body2"
            className={classNames("activity-card-title", {
              "card-on-focus": onFocus
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
        <div className="activity-card-timer-container">
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
  activityOnFocus,
  pushActivitySwitchEvent
}) {
  const modals = React.useContext(ModalContext);

  const theme = useTheme();
  const handleActivitySwitch = activityName => () => {
    if (activityName === ACTIVITIES.end.name) {
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
              onFocus={activity.name === activityOnFocus}
              onClick={handleActivitySwitch(activity.name)}
              baseColor={
                activity.name === ACTIVITIES.end.name &&
                theme.palette[activity.name]
              }
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
