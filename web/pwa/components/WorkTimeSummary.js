import React from "react";
import Typography from "@mui/material/Typography";
import {
  DAY,
  formatDateTime,
  formatTimeOfDay,
  formatTimer,
  getStartOfDay,
  LONG_BREAK_DURATION,
  now
} from "common/utils/time";
import Box from "@mui/material/Box";
import { computeTotalActivityDurations } from "common/utils/metrics";
import Grid from "@mui/material/Grid";
import omit from "lodash/omit";
import { EXPENDITURES } from "common/utils/expenditures";
import {
  filterActivitiesOverlappingPeriod,
  sortActivities
} from "common/utils/activities";
import { InfoCard, MetricCard } from "../../common/InfoCard";

function formatRangeString(startTime, endTime) {
  return getStartOfDay(startTime) === getStartOfDay(endTime - 1)
    ? `De ${formatTimeOfDay(startTime)} à ${formatTimeOfDay(endTime)}`
    : `Du ${formatDateTime(startTime)} au ${formatDateTime(endTime)}`;
}

export function WorkTimeSummaryKpiGrid({ metrics, cardProps = {}, loading }) {
  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems={"baseline"}
      spacing={2}
    >
      {metrics.map((metric, index) => {
        const CardComponent = metric.render ? InfoCard : MetricCard;
        return (
          <Grid key={index} item xs={metric.fullWidth ? 12 : true}>
            <CardComponent
              {...omit(metric, "render")}
              {...cardProps}
              loading={loading}
            >
              {metric.render && metric.render()}
            </CardComponent>
          </Grid>
        );
      })}
    </Grid>
  );
}

export function computeTimesAndDurationsFromActivities(
  activities,
  fromTime = null,
  untilTime = null
) {
  const notDismissedActivities = activities.filter(a => !a.isMissionDeleted);
  const filteredActivities = filterActivitiesOverlappingPeriod(
    notDismissedActivities,
    fromTime,
    untilTime
  );

  if (filteredActivities.length === 0)
    return {
      startTime: null,
      endTime: null,
      timers: null,
      innerLongBreaks: [],
      filteredActivities: [],
      activityGroups: []
    };

  const endTime = Math.min(
    filteredActivities[filteredActivities.length - 1].endTime || now(),
    untilTime || now()
  );
  const startTime = Math.max(filteredActivities[0].startTime, fromTime);

  const innerLongBreaks = [];
  const activityGroups = [];
  let currentActivityGroup;
  filteredActivities.forEach((activity, index) => {
    const previousActivity = index > 0 ? filteredActivities[index - 1] : null;
    const breakDuration =
      index > 0 ? activity.startTime - previousActivity.endTime : -1;
    if (breakDuration >= LONG_BREAK_DURATION) {
      innerLongBreaks.push({
        startTime: previousActivity.endTime,
        endTime: activity.startTime,
        duration: breakDuration
      });
      currentActivityGroup = null;
    }
    if (!currentActivityGroup) {
      currentActivityGroup = { activities: [] };
      activityGroups.push(currentActivityGroup);
    }
    currentActivityGroup.startTime =
      currentActivityGroup.startTime || activity.startTime;
    currentActivityGroup.endTime = activity.endTime || untilTime;
    currentActivityGroup.activities.push(activity);
  });

  const dayTimers = computeTotalActivityDurations(
    notDismissedActivities,
    fromTime,
    untilTime
  );

  return {
    startTime,
    endTime,
    timers: dayTimers,
    innerLongBreaks,
    filteredActivities,
    activityGroups
  };
}

export function renderMissionKpis(
  kpis,
  serviceLabel = "Amplitude",
  showInnerBreaksInsteadOfService = false
) {
  const { timers, startTime, endTime, innerLongBreaks } = kpis;

  const formattedKpis = [];

  let subText = null;
  if (showInnerBreaksInsteadOfService && innerLongBreaks.length > 0) {
    const innerLongBreak = innerLongBreaks[0];
    subText = formatRangeString(
      innerLongBreak.startTime,
      innerLongBreak.endTime
    );
    formattedKpis.push({
      label: "Repos journalier",
      value: formatTimer(innerLongBreak.duration),
      subText
    });
  } else {
    subText = formatRangeString(startTime, endTime);
    formattedKpis.push({
      label: kpis.innerLongBreaks.length > 0 ? "Durée" : serviceLabel,
      value: formatTimer(timers ? timers.total : 0),
      subText
    });
  }

  formattedKpis.push({
    label: "Temps de travail",
    value: formatTimer(timers ? timers.totalWork : 0),
    subText,
    hideSubText: true
  });

  return formattedKpis;
}

export function splitByLongBreaksAndComputePeriodStats(
  activities,
  fromTime,
  untilTime,
  missions
) {
  sortActivities(activities);

  let civilDay = fromTime;
  let workedDays = 0;
  let activityIndex = 0;

  while (civilDay < untilTime && activityIndex < activities.length) {
    const nextDay = civilDay + DAY;
    const activity = activities[activityIndex];

    if (
      activity.isMissionDeleted ||
      (activity.endTime && activity.endTime < civilDay)
    )
      activityIndex++;
    else if (
      !activity.isMissionDeleted &&
      activity.startTime < nextDay &&
      civilDay < now()
    ) {
      workedDays++;
      civilDay = nextDay;
    } else civilDay = nextDay;
  }

  const {
    timers,
    startTime,
    endTime,
    innerLongBreaks,
    activityGroups,
    filteredActivities
  } = computeTimesAndDurationsFromActivities(activities, fromTime, untilTime);

  const expendituresCount = {};
  if (missions)
    missions.forEach(m => {
      m.expenditures.forEach(e => {
        if (e.receptionTime >= fromTime && e.receptionTime < untilTime) {
          expendituresCount[e.type] = (expendituresCount[e.type] || 0) + 1;
        }
      });
    });

  return {
    timers,
    startTime,
    endTime,
    innerLongBreaks,
    workedDays,
    expendituresCount,
    filteredActivities,
    activityGroups
  };
}

export function renderPeriodKpis(
  kpis,
  showInnerBreaksInsteadOfService = false
) {
  const formattedKpis = [];

  let subText = null;
  if (showInnerBreaksInsteadOfService && kpis.innerLongBreaks.length > 0) {
    const innerLongBreak = kpis.innerLongBreaks[0];
    subText = formatRangeString(
      innerLongBreak.startTime,
      innerLongBreak.endTime
    );
    formattedKpis.push({
      name: "rest",
      label: "Repos journalier",
      value: formatTimer(innerLongBreak.duration),
      subText
    });
  } else {
    subText = formatRangeString(kpis.startTime, kpis.endTime);
    formattedKpis.push({
      name: "service",
      label: "Amplitude",
      value: formatTimer(kpis.timers ? kpis.timers.total : 0),
      subText
    });
  }

  formattedKpis.push(
    {
      name: "workedDays",
      label: "Jours travaillés",
      value: kpis.workedDays,
      subText,
      hideSubText: true
    },
    {
      name: "workTime",
      label: "Temps de travail",
      value: formatTimer(kpis.timers ? kpis.timers.totalWork : 0),
      subText,
      hideSubText: true
    }
  );
  if (Object.keys(kpis.expendituresCount).length > 0)
    formattedKpis.push({
      name: "expenditures",
      label: "Frais",
      fullWidth: true,
      render: () => (
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems={"center"}
          spacing={1}
        >
          {Object.keys(kpis.expendituresCount).map(type => (
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
                  {kpis.expendituresCount[type]}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )
    });
  return formattedKpis;
}
