import React from "react";
import Typography from "@material-ui/core/Typography";
import { formatTimeOfDay, formatTimer } from "common/utils/time";
import Box from "@material-ui/core/Box";
import { computeTotalActivityDurations } from "common/utils/metrics";
import { ACTIVITIES } from "common/utils/activities";
import Divider from "@material-ui/core/Divider";
import { getTime } from "common/utils/events";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  overviewTimer: {
    padding: theme.spacing(1),
    fontWeight: "bold",
    fontSize: "200%"
  },
  additionalInfo: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  }
}));

export function WorkTimeSummaryKpi({ label, value, subText, hideSubText }) {
  const classes = useStyles();

  return (
    <Card>
      <Box px={2} py={1} m={"auto"}>
        <Typography>{label}</Typography>
        <Typography className={classes.overviewTimer} variant="h1">
          {value}
        </Typography>
        {subText && (
          <Typography className={hideSubText && "hidden"} variant="caption">
            {subText}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

export function WorkTimeSummaryAdditionalInfo({ children, className }) {
  const classes = useStyles();
  return (
    <Card className={classes.additionalInfo}>
      <Box px={2} py={1} mx={"auto"} style={{ textAlign: "left" }}>
        {React.Children.map(children, (child, index) => [
          child,
          index < React.Children.count(children) - 1 ? (
            <Divider key={index} />
          ) : null
        ])}
      </Box>
    </Card>
  );
}

export function WorkTimeSummaryKpiGrid({ metrics }) {
  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems={"center"}
      spacing={2}
    >
      {metrics.map((metric, index) => (
        <Grid key={index} item xs>
          <WorkTimeSummaryKpi {...metric} />
        </Grid>
      ))}
    </Grid>
  );
}

export function computeDayKpis(activityEvents) {
  const dayTimers = computeTotalActivityDurations(activityEvents);
  const serviceHourString = `De ${formatTimeOfDay(
    getTime(activityEvents[0])
  )} à ${formatTimeOfDay(getTime(activityEvents[activityEvents.length - 1]))}`;
  return [
    {
      label: "Amplitude",
      value: formatTimer(dayTimers.total),
      subText: serviceHourString
    },
    {
      label: "Temps de travail",
      value: formatTimer(dayTimers.totalWork),
      subText: serviceHourString,
      hideSubText: true
    }
  ];
}

export function computeWeekKpis(activityEventsPerDay) {
  const timersPerDay = activityEventsPerDay.map(dayEvents =>
    computeTotalActivityDurations(dayEvents)
  );
  const weekTimers = {};
  timersPerDay.forEach(timer => {
    Object.values(ACTIVITIES).forEach(activity => {
      weekTimers[activity.name] =
        (weekTimers[activity.name] || 0) + (timer[activity.name] || 0);
    });
    weekTimers["totalWork"] =
      (weekTimers["totalWork"] || 0) + (timer["totalWork"] || 0);
  });

  return [
    {
      label: "Jours travaillés",
      value: activityEventsPerDay.length
    },
    {
      label: "Temps de travail",
      value: formatTimer(weekTimers.totalWork)
    }
  ];
}
