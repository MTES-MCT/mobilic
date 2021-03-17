import React from "react";
import Typography from "@material-ui/core/Typography";
import {
  formatDateTime,
  formatTimeOfDay,
  formatTimer,
  getStartOfDay,
  now
} from "common/utils/time";
import Box from "@material-ui/core/Box";
import { computeTotalActivityDurations } from "common/utils/metrics";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import moment from "moment";
import omit from "lodash/omit";
import { EXPENDITURES } from "common/utils/expenditures";
import { groupMissionsByPeriod } from "common/utils/history";

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
  render = null,
  ...other
}) {
  const classes = useStyles();

  return (
    <Card
      {...omit(other, ["style"])}
      style={{ textAlign: "center", ...(other.style || {}) }}
    >
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
  disablePadding = false,
  ...other
}) {
  const classes = useStyles({ disableTopMargin, disableBottomMargin });
  return (
    <Card
      className={`${classes.additionalInfo} ${other.className || ""}`}
      {...omit(other, ["className"])}
    >
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

export function WorkTimeSummaryKpiGrid({ metrics, cardProps = {} }) {
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
          <WorkTimeSummaryKpi {...metric} {...cardProps} />
        </Grid>
      ))}
    </Grid>
  );
}

function computeTimesAndDurationsFromActivities(
  activities,
  fromTime = null,
  untilTime = null
) {
  const dayTimers = computeTotalActivityDurations(
    activities,
    fromTime,
    untilTime
  );

  const filteredActivities = activities.filter(
    a =>
      (!fromTime || a.endTime > fromTime) &&
      (!untilTime || a.startTime < untilTime)
  );
  const endTime = Math.min(
    filteredActivities[filteredActivities.length - 1].endTime || now(),
    untilTime || now()
  );
  const startTime = Math.max(filteredActivities[0].startTime, fromTime);

  const serviceHourString =
    getStartOfDay(startTime) === getStartOfDay(endTime)
      ? `De ${formatTimeOfDay(startTime)} à ${formatTimeOfDay(endTime)}`
      : `Du ${formatDateTime(startTime)} au ${formatDateTime(endTime)}`;
  return {
    startTime,
    endTime,
    serviceHourString,
    timers: dayTimers
  };
}

export function computeMissionKpis(mission, fromTime = null, untilTime = null) {
  const { timers, serviceHourString } = computeTimesAndDurationsFromActivities(
    mission.activities,
    fromTime,
    untilTime
  );

  return [
    {
      label: fromTime ? "Amplitude sur la journée" : "Amplitude",
      value: formatTimer(timers.total),
      subText: serviceHourString
    },
    {
      label: fromTime ? "Travail sur la journée" : "Temps de travail",
      value: formatTimer(timers.totalWork),
      subText: serviceHourString,
      hideSubText: true
    }
  ];
}

export function computePeriodKpis(missions, fromTime = null, untilTime = null) {
  const missionsPerDay = groupMissionsByPeriod(
    missions,
    getStartOfDay,
    moment.duration(1, "days")
  );

  const activities = missions.reduce(
    (acts, mission) => [...acts, ...mission.activities],
    []
  );
  const { timers, serviceHourString } = computeTimesAndDurationsFromActivities(
    activities,
    fromTime,
    untilTime
  );

  const expendituresCount = {};
  missions.forEach(m => {
    m.expenditures.forEach(e => {
      expendituresCount[e.type] = (expendituresCount[e.type] || 0) + 1;
    });
  });

  const metrics = [
    {
      name: "service",
      label: "Amplitude",
      value: formatTimer(timers.total),
      subText: serviceHourString
    },
    {
      name: "workedDays",
      label: "Jours travaillés",
      value: Object.keys(missionsPerDay).length,
      subText: serviceHourString,
      hideSubText: true
    },
    {
      name: "workTime",
      label: "Temps de travail",
      value: formatTimer(timers.totalWork),
      subText: serviceHourString,
      hideSubText: true
    }
  ];
  if (Object.keys(expendituresCount).length > 0)
    metrics.push({
      name: "expenditures",
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
