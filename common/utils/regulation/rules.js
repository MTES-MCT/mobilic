import { ACTIVITIES } from "../activities";
import {
  HOUR,
  LONG_BREAK_DURATION,
  now,
  MINUTE,
  DAY,
  getStartOfDay
} from "../time";
import { ALERT_TYPES } from "./alertTypes";

const MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK = HOUR * 6;
const MAXIMUM_DURATION_OF_DAY_WORK_IN_HOURS = 12;
const MAXIMUM_DURATION_OF_NIGHT_WORK_IN_HOURS = 10;
const MINIMUM_DURATION_OF_INDIVIDUAL_BREAK = MINUTE * 15;

export function isNightWork(activity) {
  if (activity.endTime === activity.startTime) return false;
  const startTimeAsDateTime = new Date(activity.startTime * 1000);
  const minuteOfDay =
    startTimeAsDateTime.getHours() * 60 + startTimeAsDateTime.getMinutes();

  if (minuteOfDay < 300) return true;
  const nextMidnight = getStartOfDay(activity.startTime + DAY);
  return (activity.endTime || now()) > nextMidnight;
}

export const RULE_RESPECT_STATUS = {
  success: 1,
  failure: 3,
  pending: 2
};

export function checkMaximumDurationOfUninterruptedWork(activities) {
  const now1 = now();
  let currentUninterruptedWorkDuration = 0;
  let latestWorkTime = null;

  // consider all activities excluding transfers
  // exit loop if we find a consecutive series of activites with span time > MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK
  activities
    .filter(a => a.type !== ACTIVITIES.transfer.name)
    .every(a => {
      if (!latestWorkTime || a.startTime > latestWorkTime) {
        currentUninterruptedWorkDuration = 0;
      }
      currentUninterruptedWorkDuration =
        currentUninterruptedWorkDuration + (a.endTime || now1) - a.startTime;
      if (
        currentUninterruptedWorkDuration >
        MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK
      ) {
        return false;
      }
      latestWorkTime = a.endTime;
      return true;
    });

  const isRuleBroken =
    currentUninterruptedWorkDuration > MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK;
  return {
    status: isRuleBroken
      ? RULE_RESPECT_STATUS.failure
      : RULE_RESPECT_STATUS.success,
    rule: ALERT_TYPES.maximumUninterruptedWorkTime
  };
}

function computeAmplitude(workDayActivities) {
  const now1 = now();
  return workDayActivities
    .map(a => (a.endTime || now1) - a.startTime)
    .reduce((acc, value) => acc + value, 0);
}

export function checkMaximumDurationOfWork(workDayActivities) {
  const dailyAmplitude = computeAmplitude(workDayActivities);

  const nightWork = workDayActivities.some(a => isNightWork(a));

  const maximumTimeInHours = nightWork
    ? MAXIMUM_DURATION_OF_NIGHT_WORK_IN_HOURS
    : MAXIMUM_DURATION_OF_DAY_WORK_IN_HOURS;

  return {
    status:
      dailyAmplitude > maximumTimeInHours * HOUR
        ? RULE_RESPECT_STATUS.failure
        : RULE_RESPECT_STATUS.success,
    rule: ALERT_TYPES.maximumWorkDayTime,
    extra: {
      nightWork,
      maximumTimeInHours
    }
  };
}

export function checkMinimumDurationOfBreak(workDayActivities) {
  const dailyAmplitude = computeAmplitude(workDayActivities);

  if (dailyAmplitude > 6 * HOUR) {
    let totalBreakTime = 0;
    let latestWorkTime = null;
    workDayActivities.forEach(a => {
      if (
        latestWorkTime &&
        a.startTime - latestWorkTime >= MINIMUM_DURATION_OF_INDIVIDUAL_BREAK
      )
        totalBreakTime = totalBreakTime + a.startTime - latestWorkTime;
      latestWorkTime = a.endTime;
    });
    if (dailyAmplitude <= 9 * HOUR && totalBreakTime < 30 * MINUTE)
      return {
        status: RULE_RESPECT_STATUS.failure,
        rule: ALERT_TYPES.minimumWorkDayBreak,
        extra: {
          minimumTimeInMinutes: 30
        }
      };
    if (dailyAmplitude > 9 * HOUR && totalBreakTime < 45 * MINUTE)
      return {
        status: RULE_RESPECT_STATUS.failure,
        rule: ALERT_TYPES.minimumWorkDayBreak,
        extra: {
          minimumTimeInMinutes: 45
        }
      };
  }
  return {
    status: RULE_RESPECT_STATUS.success,
    rule: ALERT_TYPES.minimumWorkDayBreak
  };
}

export function checkMinimumDurationOfWeeklyRest(
  nWorkedDays,
  longInnerBreaks,
  weekStart,
  previousWeekEnd
) {
  if (nWorkedDays > 6)
    return {
      status: RULE_RESPECT_STATUS.failure,
      rule: ALERT_TYPES.maximumWorkedDaysInWeek,
      extra: {
        tooManyDays: true
      }
    };

  const innerWeeklyRest = longInnerBreaks.find(
    b => b.duration >= DAY + LONG_BREAK_DURATION
  );
  const innerWeeklyRestDuration = innerWeeklyRest
    ? innerWeeklyRest.duration
    : 0;

  if (!previousWeekEnd) {
    return {
      status: RULE_RESPECT_STATUS.success,
      rule: ALERT_TYPES.maximumWorkedDaysInWeek
    };
  }
  const outerWeeklyRestDuration = weekStart - previousWeekEnd;
  if (
    !innerWeeklyRestDuration &&
    outerWeeklyRestDuration < DAY + LONG_BREAK_DURATION
  ) {
    return {
      status: RULE_RESPECT_STATUS.failure,
      rule: ALERT_TYPES.maximumWorkedDaysInWeek,
      extra: {
        restDuration: outerWeeklyRestDuration
      }
    };
  }

  const restDuration = Math.max(
    innerWeeklyRestDuration,
    outerWeeklyRestDuration
  );

  return {
    status: RULE_RESPECT_STATUS.success,
    rule: ALERT_TYPES.maximumWorkedDaysInWeek,
    extra: {
      restDuration: restDuration
    }
  };
}
