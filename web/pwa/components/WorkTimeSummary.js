import React from "react";
import Typography from "@mui/material/Typography";
import {
  DAY,
  formatDateTime,
  formatMinutesFromSeconds,
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
import { partition } from "lodash";

export function formatRangeString(startTime, endTime) {
  return getStartOfDay(startTime) === getStartOfDay(endTime - 1)
    ? `De ${formatTimeOfDay(startTime)} à ${formatTimeOfDay(endTime)}`
    : `Du ${formatDateTime(startTime)} au ${formatDateTime(endTime)}`;
}

export function WorkTimeSummaryKpiGrid({ metrics, cardProps = {}, loading }) {
  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => {
        const CardComponent = metric.render ? InfoCard : MetricCard;
        return (
          <Grid item xs={6} key={index} sx={{ display: "flex" }}>
            <CardComponent
              {...omit(metric, "render")}
              {...cardProps}
              loading={loading}
              titleProps={{ component: "h2" }}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
              centered
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

const diffSecondsToText = diffInS =>
  diffInS === 0
    ? ""
    : `${diffInS > 0 ? "+" : "-"}${formatMinutesFromSeconds(
        Math.abs(diffInS),
        false
      )}`;
export function renderMissionKpis(
  adminKpis,
  employeeKpis,
  displayEmployee,
  serviceLabel = "Amplitude",
  showInnerBreaksInsteadOfService = false
) {
  const kpis = displayEmployee && employeeKpis ? employeeKpis : adminKpis;
  const { timers, startTime, endTime, innerLongBreaks } = kpis;

  const formattedKpis = [];

  let subText = null;
  let diffInS = 0;
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
    if (
      !displayEmployee &&
      adminKpis?.timers?.total &&
      employeeKpis?.timers?.total
    ) {
      diffInS = adminKpis.timers.total - employeeKpis.timers.total;
    }
    formattedKpis.push({
      label: kpis.innerLongBreaks.length > 0 ? "Durée" : serviceLabel,
      value: formatTimer(timers ? timers.total : 0),
      subText,
      diffText: diffSecondsToText(diffInS)
    });
  }

  diffInS = 0;
  if (
    !displayEmployee &&
    adminKpis?.timers?.totalWork &&
    employeeKpis?.timers?.totalWork
  ) {
    diffInS = adminKpis.timers.totalWork - employeeKpis.timers.totalWork;
  }
  formattedKpis.push({
    label: "Temps de travail",
    value: formatTimer(timers ? timers.totalWork : 0),
    subText,
    hideSubText: true,
    diffText: diffSecondsToText(diffInS)
  });

  return formattedKpis;
}

const getNbDistinctDays = (fromTime, untilTime, activities) => {
  let civilDay = fromTime;
  let counter = 0;
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
      counter++;
      civilDay = nextDay;
    } else civilDay = nextDay;
  }
  return counter;
};
export function splitByLongBreaksAndComputePeriodStats(
  activities,
  fromTime,
  untilTime,
  missions
) {
  sortActivities(activities);

  const [workActivities, offActivities] = partition(
    activities,
    activity => activity.type !== "off"
  );

  const workedDays = getNbDistinctDays(fromTime, untilTime, workActivities);
  const offDays = getNbDistinctDays(fromTime, untilTime, offActivities);

  const {
    timers,
    startTime,
    endTime,
    innerLongBreaks,
    activityGroups,
    filteredActivities
  } = computeTimesAndDurationsFromActivities(
    workActivities,
    fromTime,
    untilTime
  );

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
    offDays,
    expendituresCount,
    filteredActivities,
    activityGroups
  };
}

export function renderPeriodKpis(
  adminKpis,
  employeeKpis,
  displayEmployee,
  showInnerBreaksInsteadOfService = false
) {
  const kpis = displayEmployee && employeeKpis ? employeeKpis : adminKpis;

  const formattedKpis = [];

  let subText = null;
  let diffInS = 0;
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
    if (
      !displayEmployee &&
      employeeKpis?.timers?.total &&
      adminKpis?.timers?.total
    ) {
      diffInS = adminKpis.timers.total - employeeKpis.timers.total;
    }
    formattedKpis.push({
      name: "service",
      label: "Amplitude",
      value: formatTimer(kpis.timers ? kpis.timers.total : 0),
      subText,
      diffText: diffSecondsToText(diffInS)
    });
  }

  formattedKpis.push({
    name: "workedDays",
    label: "Jours travaillés",
    value: kpis.workedDays,
    subText,
    hideSubText: true
  });

  diffInS = 0;
  if (
    !displayEmployee &&
    adminKpis?.timers?.totalWork &&
    employeeKpis?.timers?.totalWork
  ) {
    diffInS = adminKpis.timers.totalWork - employeeKpis.timers.totalWork;
  }
  const workTimeKpis = {
    name: "workTime",
    label: "Temps de travail",
    value: formatTimer(kpis.timers ? kpis.timers.totalWork : 0),
    subText,
    hideSubText: true,
    diffText: diffSecondsToText(diffInS)
  };

  formattedKpis.push(workTimeKpis);
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
                  component="h2"
                >
                  {EXPENDITURES[type].plural}
                </Typography>
                <Typography
                  variant="h4"
                  component="span"
                  style={{ fontWeight: "bold" }}
                >
                  {kpis.expendituresCount[type]}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )
    });
  if (kpis.offDays) {
    formattedKpis.push({
      name: "offDays",
      label: "Jours congé ou absence",
      value: kpis.offDays,
      fullWidth: true
    });
  }
  return formattedKpis;
}
