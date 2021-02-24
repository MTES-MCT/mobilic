import {
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek
} from "common/utils/time";

function computeWorkDayGroupAggregates(workDayGroup) {
  const aggregateTimers = {};
  const aggregateExpenditures = {};
  let serviceDuration = 0;
  let totalWorkDuration = 0;
  let minStartTime;
  let maxEndTime;
  workDayGroup.forEach(wd => {
    Object.keys(wd.activityDurations).forEach(key => {
      aggregateTimers[key] =
        (aggregateTimers[key] || 0) + wd.activityDurations[key];
    });
    serviceDuration = serviceDuration + wd.serviceDuration;
    totalWorkDuration = totalWorkDuration + wd.totalWorkDuration;
    if (wd.expenditures) {
      Object.keys(wd.expenditures).forEach(exp => {
        aggregateExpenditures[exp] =
          (aggregateExpenditures[exp] || 0) + wd.expenditures[exp];
      });
    }
    minStartTime = minStartTime
      ? Math.min(wd.startTime, minStartTime)
      : wd.startTime;
    maxEndTime = maxEndTime ? Math.max(wd.endTime, maxEndTime) : wd.endTime;
  });
  return {
    user: workDayGroup[0].user,
    periodStart: workDayGroup[0].periodStart,
    periodActualStart: minStartTime,
    periodActualEnd: maxEndTime,
    workedDays: workDayGroup.length,
    service: serviceDuration,
    totalWork: totalWorkDuration,
    rest: serviceDuration - totalWorkDuration,
    timers: aggregateTimers,
    missionNames: workDayGroup.reduce(
      (acc, wd) => acc.concat(wd.missionNames),
      []
    ),
    expenditures: aggregateExpenditures
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
  workDays.forEach(wd => {
    const periodStart = periodFunction(wd.startTime);
    const key = `${wd.user.id}${periodStart}`;
    if (!workDaysGroupedByUserAndPeriod[key])
      workDaysGroupedByUserAndPeriod[key] = [];
    const userWorkdaysForPeriod = workDaysGroupedByUserAndPeriod[key];
    userWorkdaysForPeriod.push({ ...wd, periodStart });
  });
  const flatAggregatedWorkDays = Object.values(
    workDaysGroupedByUserAndPeriod
  ).map(group => {
    const aggregateMetrics = computeWorkDayGroupAggregates(group);
    return period === "day"
      ? { ...group[0], ...aggregateMetrics }
      : aggregateMetrics;
  });
  return flatAggregatedWorkDays;
}
