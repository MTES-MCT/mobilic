import { ACTIVITIES } from "common/utils/activities";
import {
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek
} from "common/utils/time";
import uniq from "lodash/uniq";

function computeWorkDayGroupAggregates(workDayGroup) {
  const aggregateTimers = {};
  const aggregateExpenditures = {};
  let serviceDuration = 0;
  let totalWorkDuration = 0;
  let transferDuration = 0;
  let offDuration = 0;
  let minStartTime;
  let maxEndTime;
  let dailyAlerts = 0;
  let weeklyAlerts = 0;
  workDayGroup.forEach((wd) => {
    Object.keys(wd.activityDurations).forEach((key) => {
      aggregateTimers[key] =
        (aggregateTimers[key] || 0) + wd.activityDurations[key];
    });
    serviceDuration = serviceDuration + wd.serviceDuration;
    totalWorkDuration = totalWorkDuration + wd.totalWorkDuration;
    transferDuration = aggregateTimers[ACTIVITIES.transfer.name] || 0;
    offDuration = aggregateTimers[ACTIVITIES.off.name] || 0;
    if (wd.expenditures) {
      Object.keys(wd.expenditures).forEach((exp) => {
        aggregateExpenditures[exp] =
          (aggregateExpenditures[exp] || 0) + wd.expenditures[exp];
      });
    }
    minStartTime = minStartTime
      ? Math.min(wd.startTime, minStartTime)
      : wd.startTime;
    maxEndTime = maxEndTime ? Math.max(wd.endTime, maxEndTime) : wd.endTime;
    dailyAlerts =
      dailyAlerts + wd.regulationComputations?.nbAlertsDailyAdmin || 0;
    weeklyAlerts =
      weeklyAlerts + wd.regulationComputations?.nbAlertsWeeklyAdmin || 0;
  });
  return {
    user: workDayGroup[0].user,
    periodStart: workDayGroup[0].periodStart,
    periodActualStart: minStartTime,
    periodActualEnd: maxEndTime,
    workedDays: workDayGroup.length,
    service: serviceDuration,
    totalWork: maxEndTime ? totalWorkDuration : null,
    transferDuration,
    rest: maxEndTime
      ? serviceDuration - totalWorkDuration - transferDuration - offDuration
      : null,
    timers: aggregateTimers,
    companyIds: uniq(workDayGroup.map((wd) => wd.companyId)),
    missionNames: workDayGroup.reduce(
      (acc, wd) => Object.assign(acc, wd.missionNames),
      {}
    ),
    expenditureAggs: aggregateExpenditures,
    lastActivityStartTime: workDayGroup[0].lastActivityStartTime,
    dailyAlerts,
    weeklyAlerts
  };
}

export function aggregateWorkDayPeriods(workDays, period) {
  const workDaysGroupedByUserAndPeriod = {};
  let periodFunction = getStartOfDay;
  if (period === "week") {
    periodFunction = getStartOfWeek;
  }
  if (period === "month") {
    periodFunction = getStartOfMonth;
  }
  workDays.forEach((wd) => {
    const periodStart = periodFunction(wd.startTime);
    const key = `${wd.user.id}${periodStart}`;
    if (!workDaysGroupedByUserAndPeriod[key])
      workDaysGroupedByUserAndPeriod[key] = [];
    const userWorkdaysForPeriod = workDaysGroupedByUserAndPeriod[key];
    userWorkdaysForPeriod.push({ ...wd, periodStart });
  });
  const flatAggregatedWorkDays = Object.values(
    workDaysGroupedByUserAndPeriod
  ).map((group) => {
    const aggregateMetrics = computeWorkDayGroupAggregates(group);
    return period === "day"
      ? { ...group[0], ...aggregateMetrics }
      : aggregateMetrics;
  });
  return flatAggregatedWorkDays;
}
