import React from "react";
import Typography from "@material-ui/core/Typography";
import {
  formatTimeOfDay,
  formatTimer,
  getStartOfDay,
  now
} from "common/utils/time";
import Box from "@material-ui/core/Box";
import { computeTotalActivityDurations } from "common/utils/metrics";
import { ACTIVITIES } from "common/utils/activities";
import Divider from "@material-ui/core/Divider";
import { getTime } from "common/utils/events";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import groupBy from "lodash/groupBy";
import { EXPENDITURES } from "common/utils/expenditures";

const useStyles = makeStyles(theme => ({
  overviewTimer: {
    padding: theme.spacing(1),
    fontWeight: "bold",
    fontSize: "200%"
  },
  additionalInfo: {
    marginTop: ({ disableTopMargin }) =>
      disableTopMargin ? 0 : theme.spacing(4),
    marginBottom: ({ disableBottomMargin }) =>
      disableBottomMargin ? 0 : theme.spacing(4)
  }
}));

export function WorkTimeSummaryKpi({
  label,
  value,
  subText,
  hideSubText,
  render = null
}) {
  const classes = useStyles();

  return (
    <Card>
      <Box px={2} py={1} m={"auto"}>
        <Typography>{label}</Typography>
        {render ? (
          render()
        ) : (
          <>
            <Typography className={classes.overviewTimer} variant="h1">
              {value}
            </Typography>
            {subText && (
              <Typography className={hideSubText && "hidden"} variant="caption">
                {subText}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Card>
  );
}

export function WorkTimeSummaryAdditionalInfo({
  children,
  disableTopMargin = false,
  disableBottomMargin = true,
  disablePadding = false
}) {
  const classes = useStyles({ disableTopMargin, disableBottomMargin });
  return (
    <Card className={classes.additionalInfo}>
      <Box
        px={disablePadding ? 0 : 2}
        py={disablePadding ? 0 : 1}
        mx={"auto"}
        style={{ textAlign: "justify" }}
      >
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
      alignItems={"baseline"}
      spacing={2}
    >
      {metrics.map((metric, index) => (
        <Grid key={index} item xs={metric.fullWidth ? 12 : true}>
          <WorkTimeSummaryKpi {...metric} />
        </Grid>
      ))}
    </Grid>
  );
}

export function computeMissionKpis(mission) {
  const dayTimers = computeTotalActivityDurations(mission.activities);
  const serviceHourString = `De ${formatTimeOfDay(
    getTime(mission)
  )} à ${formatTimeOfDay(
    mission.activities[mission.activities.length - 1].endTime || now()
  )}`;
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

export function computePeriodKpis(missions) {
  const missionsPerDay = groupBy(missions, m => getStartOfDay(getTime(m)));
  const timersPerDay = missions.map(mission =>
    computeTotalActivityDurations(mission.activities)
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

  const expendituresCount = {};
  missions.forEach(m => {
    m.expenditures.forEach(e => {
      expendituresCount[e.type] = (expendituresCount[e.type] || 0) + 1;
    });
  });

  const metrics = [
    {
      label: "Jours travaillés",
      value: Object.keys(missionsPerDay).length
    },
    {
      label: "Temps de travail",
      value: formatTimer(weekTimers.totalWork)
    }
  ];
  if (Object.keys(expendituresCount).length > 0)
    metrics.push({
      label: "Frais",
      fullWidth: true,
      render: () => (
        <Grid
          container
          direction="row"
          justify="center"
          alignItems={"center"}
          spacing={1}
        >
          {Object.keys(expendituresCount).map(type => (
            <Grid key={type} item xs>
              <Box py={1} m="auto">
                <Typography
                  variant="body2"
                  style={{
                    textTransform: "capitalize",
                    fontWeight: "bold",
                    whiteSpace: "nowrap"
                  }}
                >
                  {EXPENDITURES[type].plural}
                </Typography>
                <Typography variant="h4" style={{ fontWeight: "bold" }}>
                  {expendituresCount[type]}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )
    });
  return metrics;
}
