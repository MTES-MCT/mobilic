import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TimerIcon from '@material-ui/icons/Timer';
import {formatTimer} from "../utils/time";
import classNames from 'classnames';
import {ACTIVITIES} from "../utils/activities";


function ActivitySwitchCard ({ label, renderIcon, timer, onFocus, onClick }) {
    const color = onFocus ? "primary" : "inherit";
    const timerProps = {
        className: classNames("activity-card-timer", {"card-on-focus": onFocus, hidden: !timer}),
        color: color
    };
    return (
        <Card className="activity-card-container" onClick={onClick} raised={onFocus}>
          <CardContent className="activity-card-content">
            <Typography className={classNames("activity-card-title", {"card-on-focus": onFocus})} color={color} gutterBottom>
              {label}
            </Typography>
            {renderIcon({
                className: "activity-card-icon",
                color: color
            })}
            <div className="activity-card-timer-container">
                {onFocus && <TimerIcon {...timerProps}/>}
                <div style={{width: "1vw"}} />
                <Typography {...timerProps}>
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
