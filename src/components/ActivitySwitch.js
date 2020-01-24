import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TimerIcon from '@material-ui/icons/Timer';
import {formatTimer} from "../utils/timer";


const useStylesForCard = makeStyles(theme => ({
  card: {
    marginLeft: props => props.left ? "1vw" :"auto",
    marginRight: props => props.left ? 'auto' : "1vw",
    height: "40vw",
    width: "40vw",
    cursor: "pointer"
  },
  title: {
    fontSize: "4vw",
    fontWeight: props => props.onFocus ? "bold": "normal"
  },
  icon: {
    fontSize: "20vw"
  },
  timer: {
    fontSize: "5vw",
    fontWeight: props => props.onFocus ? "bold": "normal"
  },
  timerContainer: {
    display: "flex",
    direction: "row",
    alignItems: "center",
    justifyContent: "center"
  }
}));


const useStylesForGrid = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  grid: {
    height: "90vw",
  }
}));


function ActivitySwitchCard ({ label, renderIcon, timer, onFocus, onClick, left }) {
    const classes = useStylesForCard({ onFocus: onFocus, left: left});
    const color = onFocus ? "primary" : "inherit";
    const timerProps = {
        className: classes.timer,
        color: color
    };
    return (
        <Card className={classes.card} onClick={onClick} raised={onFocus}>
          <CardContent>
            <Typography className={classes.title} color={color} gutterBottom>
              {label}
            </Typography>
            {renderIcon({
                className: classes.icon,
                color: color
            })}
            {timer &&
                <div className={classes.timerContainer}>
                    {onFocus && <TimerIcon {...timerProps}/>}
                    <div style={{width: "1vw"}} />
                    <Typography {...timerProps}>
                        {formatTimer(timer)}
                    </Typography>
                </div>
            }
          </CardContent>
        </Card>
    )
}

export function ActivitySwitchGrid ({ activitySwitches, timers, activityOnFocus, setActivityOnFocus, pushActivitySwitchEvent }) {
    const classes = useStylesForGrid();

    const handleActivitySwitch = (activity) => () => {
        setActivityOnFocus(activity);
        pushActivitySwitchEvent({
            date: Date.now(),
            activity: activity
        });
    };

    return (
        <div className={classes.root}>
          <Grid
              container
              direction="row"
              justify="space-evenly"
              alignItems={"center"}
              className={classes.grid}
              spacing={0}
          >
            {activitySwitches.map((activitySwitch, index) => (
              <Grid item key={activitySwitch.name} xs={6}>
                <ActivitySwitchCard
                    label={activitySwitch.label}
                    renderIcon={activitySwitch.renderIcon}
                    timer={timers[activitySwitch.name]}
                    onFocus={activitySwitch.name === activityOnFocus}
                    onClick={handleActivitySwitch(activitySwitch.name)}
                    left={index % 2 === 0}
                />
              </Grid>
            ))}
          </Grid>
        </div>
    );
}
