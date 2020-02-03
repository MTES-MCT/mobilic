import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TimerIcon from '@material-ui/icons/Timer';
import {formatTimer} from "../utils/time";
import classNames from 'classnames';
import {ACTIVITIES} from "../utils/activities";


export function ActivitySwitchCard ({ label, renderIcon, timer, onFocus, onClick, className }) {
    const color = onFocus ? "primary" : "inherit";
    const timerProps = {
        className: classNames("activity-card-timer", {"card-on-focus": onFocus, hidden: !timer}),
        color: color
    };
    return (
        <Card className={className} onClick={onClick} raised={onFocus}>
          <CardContent className="activity-card-content">
            {label &&
              <Typography
                  variant="caption"
                  className={classNames("activity-card-title", {"card-on-focus": onFocus})}
                  color={color}
                  noWrap
                  gutterBottom
              >
                  {label}
              </Typography>
            }
            {renderIcon({
                className: "activity-card-icon",
                color: color
            })}
            <div className="activity-card-timer-container">
                {onFocus && <TimerIcon fontSize="inherit" {...timerProps}/>}
                <div style={{width: "1vw"}} />
                <Typography variant="caption" {...timerProps}>
                    {formatTimer(timer || 10)}
                </Typography>
            </div>
          </CardContent>
        </Card>
    )
}

export function ActivitySwitchGrid ({ timers, activityOnFocus, pushActivitySwitchEvent }) {
    const handleActivitySwitch = (activityName) => () => {
        pushActivitySwitchEvent(activityName);
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
            {Object.values(ACTIVITIES).map((activity, index) => (
              <Grid item key={activity.name}>
                <ActivitySwitchCard
                    className="activity-card-container"
                    label={activity.label}
                    renderIcon={activity.renderIcon}
                    timer={timers[activity.name]}
                    onFocus={activity.name === activityOnFocus}
                    onClick={handleActivitySwitch(activity.name)}
                />
              </Grid>
            ))}
          </Grid>
        </div>
    );
}
