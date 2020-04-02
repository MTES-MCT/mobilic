import {
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek
} from "../../common/utils/time";

function computeWorkDayGroupAggregates(workDayGroup) {
  const aggregateTimers = {};
  const aggregateExpenditures = {};
  workDayGroup.forEach(wd => {
    Object.keys(wd.activityTimers).forEach(key => {
      aggregateTimers[key] =
        (aggregateTimers[key] || 0) + wd.activityTimers[key];
    });
    wd.expenditures.forEach(exp => {
      aggregateExpenditures[exp.type] =
        (aggregateExpenditures[exp.type] || 0) + 1;
    });
  });
  return {
    userId: workDayGroup[0].userId,
    periodStart: workDayGroup[0].periodStart,
    workedDays: workDayGroup.length,
    timers: aggregateTimers,
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
    const key = `${wd.userId}${periodStart}`;
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
  const aggregatedWorkDaysByPeriod = {};
  flatAggregatedWorkDays.forEach(awd => {
    if (!aggregatedWorkDaysByPeriod[awd.periodStart])
      aggregatedWorkDaysByPeriod[awd.periodStart] = [];
    aggregatedWorkDaysByPeriod[awd.periodStart].push(awd);
  });
  return aggregatedWorkDaysByPeriod;
}
