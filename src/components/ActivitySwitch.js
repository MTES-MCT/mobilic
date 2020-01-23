import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';


const useStylesForCard = makeStyles(theme => ({
  card: {
    margin: "auto",
    height: "17vh",
    width: "25vw",
    cursor: "pointer"
  },
  title: {
    fontSize: "1.5vh",
  },
  icon: {
    fontSize: "8vh"
  },
}));


const useStylesForGrid = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  grid: {
    width: "80vw",
    height: "40vh"
  }
}));


function ActivitySwitchCard ({ label, renderIcon, timer, onFocus, onClick }) {
    const classes = useStylesForCard({ onFocus: onFocus });
    const color = onFocus ? "primary" : "inherit";
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
              <Typography color={color}>
                  {timer}
              </Typography>
            }
          </CardContent>
        </Card>
    )
}

export function ActivitySwitchGrid ({ activitySwitches, timers, activityOnFocus, setActivityOnFocus }) {
    const classes = useStylesForGrid();
    return (
        <div className={classes.root}>
          <Grid
              container
              direction="row"
              justify="space-evenly"
              alignItems={"center"}
              className={classes.grid}
          >
            {activitySwitches.map(activitySwitch => (
              <Grid item key={activitySwitch.name} xs={6}>
                <ActivitySwitchCard
                    label={activitySwitch.label}
                    renderIcon={activitySwitch.renderIcon}
                    timer={timers[activitySwitch.name]}
                    onFocus={activitySwitch.name === activityOnFocus}
                    onClick={() => setActivityOnFocus(activitySwitch.name)}
                />
              </Grid>
            ))}
          </Grid>
        </div>
    );
}
