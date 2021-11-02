import {
  computeTimesAndDurationsFromActivities,
  splitByLongBreaksAndComputePeriodStats
} from "../../../web/pwa/components/WorkTimeSummary";
import { DAY, getStartOfDay, LONG_BREAK_DURATION } from "../time";
import moment from "moment";
import {
  checkMaximumDurationOfUninterruptedWork,
  checkMaximumDurationOfWork,
  checkMinimumDurationOfBreak,
  checkMinimumDurationOfWeeklyRest,
  RULE_RESPECT_STATUS
} from "./rules";
import forEach from "lodash/forEach";
import keys from "lodash/keys";
import { PERIOD_UNITS } from "../history/periodUnits";
import { ALERT_TYPE_PROPS, ALERT_TYPES } from "./alertTypes";
import { groupMissionsByPeriodUnit } from "../history/groupByPeriodUnit";

export function computeAlerts(missions, start, end) {
  const activities = missions.reduce(
    (acc, mission) => [...acc, ...mission.activities],
    []
  );

  const stats = computeTimesAndDurationsFromActivities(activities, start, end);

  const missionsGroupedByWeek = groupMissionsByPeriodUnit(
    missions,
    PERIOD_UNITS.week
  );

  const groups = stats.activityGroups;

  let dailyRestAlerts = {};
  let dailyWorkTimeAlerts = {};
  let dailyBreakTimeAlerts = {};
  let dailyUninterruptedWorkAlerts = {};
  let weeklyWorkedDaysAlerts = {};

  groups.forEach(group => {
    const startDay = getStartOfDay(group.startTime);
    const endDay = getStartOfDay(group.endTime);

    const dailyRestRespected =
      group.endTime - group.startTime <= DAY - LONG_BREAK_DURATION;
    const dailyWorkTimeCheck = checkMaximumDurationOfWork(group.activities);
    const dailyBreakTimeCheck = checkMinimumDurationOfBreak(group.activities);
    const dailyUninterruptedWorkTimeCheck = checkMaximumDurationOfUninterruptedWork(
      group.activities
    );

    let currentDay = startDay;
    while (currentDay <= endDay) {
      if (
        !dailyRestRespected &&
        (startDay === endDay || currentDay !== startDay)
      ) {
        dailyRestAlerts[currentDay] = 1;
      }
      if (dailyWorkTimeCheck.status === RULE_RESPECT_STATUS.failure)
        dailyWorkTimeAlerts[currentDay] = 1;
      if (dailyBreakTimeCheck.status === RULE_RESPECT_STATUS.failure)
        dailyBreakTimeAlerts[currentDay] = 1;
      if (
        dailyUninterruptedWorkTimeCheck.status === RULE_RESPECT_STATUS.failure
      )
        dailyUninterruptedWorkAlerts[currentDay] = 1;

      currentDay = moment
        .unix(currentDay)
        .add(moment.duration(1, "days"))
        .unix();
    }
  });

  forEach(missionsGroupedByWeek, (ms, weekStart) => {
    const weekEnd = moment
      .unix(weekStart)
      .add(moment.duration(1, "weeks"))
      .unix();

    const weekStats = splitByLongBreaksAndComputePeriodStats(
      activities,
      weekStart,
      weekEnd,
      ms
    );

    const activitiesBefore = activities.filter(a => a.startTime < weekStart);
    const previousPeriodActivityEnd =
      activitiesBefore.length > 0
        ? Math.min(weekStart, Math.max(...activitiesBefore.map(a => a.endTime)))
        : null;

    const weeklyWorkedDaysCheck = checkMinimumDurationOfWeeklyRest(
      weekStats.workedDays,
      weekStats.innerLongBreaks,
      weekStats.startTime,
      previousPeriodActivityEnd
    );

    if (weeklyWorkedDaysCheck.status === RULE_RESPECT_STATUS.failure)
      weeklyWorkedDaysAlerts[weekStart] = 1;
  });

  dailyWorkTimeAlerts = keys(dailyWorkTimeAlerts);
  dailyBreakTimeAlerts = keys(dailyBreakTimeAlerts);
  dailyRestAlerts = keys(dailyRestAlerts);
  dailyUninterruptedWorkAlerts = keys(dailyUninterruptedWorkAlerts);
  weeklyWorkedDaysAlerts = keys(weeklyWorkedDaysAlerts);

  const alerts = [];
  if (dailyWorkTimeAlerts.length > 0) {
    alerts.push({
      ...ALERT_TYPE_PROPS[ALERT_TYPES.maximumWorkDayTime],
      alerts: dailyWorkTimeAlerts.map(day => ({ day }))
    });
  }
  if (dailyRestAlerts.length > 0) {
    alerts.push({
      ...ALERT_TYPE_PROPS[ALERT_TYPES.minimumDailyRest],
      alerts: dailyRestAlerts.map(day => ({ day }))
    });
  }
  if (dailyUninterruptedWorkAlerts.length > 0) {
    alerts.push({
      ...ALERT_TYPE_PROPS[ALERT_TYPES.maximumUninterruptedWorkTime],
      alerts: dailyUninterruptedWorkAlerts.map(day => ({ day }))
    });
  }
  if (dailyBreakTimeAlerts.length > 0) {
    alerts.push({
      ...ALERT_TYPE_PROPS[ALERT_TYPES.minimumWorkDayBreak],
      alerts: dailyBreakTimeAlerts.map(day => ({ day }))
    });
  }
  if (weeklyWorkedDaysAlerts.length > 0) {
    alerts.push({
      ...ALERT_TYPE_PROPS[ALERT_TYPES.maximumWorkedDaysInWeek],
      alerts: weeklyWorkedDaysAlerts.map(day => ({ week: day }))
    });
  }
  return alerts;
}
