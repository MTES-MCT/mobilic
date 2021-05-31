import {
  formatTimer,
  HOUR,
  LONG_BREAK_DURATION,
  now,
  MINUTE,
  DAY
} from "./time";

const MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK = HOUR * 6;
const MAXIMUM_DURATION_OF_WORK = HOUR * 12;
const MINIMUM_DURATION_OF_INDIVIDUAL_BREAK = MINUTE * 15;

export const RULE_RESPECT_STATUS = {
  success: 1,
  failure: 3,
  pending: 2
};

export function checkMinimumDurationOfDailyRest(dayEnd, followingDayStart) {
  const checkDayRestAt = followingDayStart ? followingDayStart : now();
  const dayRestDuration = checkDayRestAt - dayEnd;
  const ruleRespected = dayRestDuration >= LONG_BREAK_DURATION;
  if (ruleRespected) {
    return {
      status: RULE_RESPECT_STATUS.success,
      message: `Repos journalier respecté (${
        dayRestDuration > 48 * HOUR ? "> 48h" : formatTimer(dayRestDuration)
      }) !`
    };
  } else if (followingDayStart) {
    return {
      status: RULE_RESPECT_STATUS.failure,
      message: `Repos journalier trop court (${formatTimer(dayRestDuration)}) !`
    };
  }
  return {
    status: RULE_RESPECT_STATUS.pending,
    message: `Repos journalier en cours (encore au moins ${formatTimer(
      LONG_BREAK_DURATION - dayRestDuration
    )}) !`
  };
}

export function checkMaximumDurationOfUninterruptedWork(activities) {
  const now1 = now();
  let currentUninterruptedWorkDuration = 0;
  let latestWorkTime = null;
  activities.every(a => {
    if (!latestWorkTime || a.startTime > latestWorkTime) {
      currentUninterruptedWorkDuration = 0;
    }
    currentUninterruptedWorkDuration =
      currentUninterruptedWorkDuration + (a.endTime || now1) - a.startTime;
    if (
      currentUninterruptedWorkDuration > MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK
    ) {
      return false;
    }
    latestWorkTime = a.endTime;
    return true;
  });

  if (currentUninterruptedWorkDuration > MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK)
    return {
      status: RULE_RESPECT_STATUS.failure,
      message: `Travail ininterrompu pendant plus de 6 heures !`
    };

  return {
    status: RULE_RESPECT_STATUS.success,
    message: "Durée maximale de travail ininterrompu < 6h !"
  };
}

function computeTotalWorkDuration(workDayActivities) {
  const now1 = now();
  return workDayActivities
    .map(a => (a.endTime || now1) - a.startTime)
    .reduce((acc, value) => acc + value, 0);
}

export function checkMaximumDurationOfWork(workDayActivities) {
  const totalWorkDuration = computeTotalWorkDuration(workDayActivities);

  if (totalWorkDuration > MAXIMUM_DURATION_OF_WORK)
    return {
      status: RULE_RESPECT_STATUS.failure,
      message: "Durée du travail quotidien > 12h !"
    };
  return {
    status: RULE_RESPECT_STATUS.success,
    message: "Durée du travail quotidien < 12h !"
  };
}

export function checkMinimumDurationOfBreak(workDayActivities) {
  const totalWorkDuration = computeTotalWorkDuration(workDayActivities);

  if (totalWorkDuration > 6 * HOUR) {
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
    if (totalWorkDuration <= 9 * HOUR && totalBreakTime < 30 * MINUTE)
      return {
        status: RULE_RESPECT_STATUS.failure,
        message: "Temps de pause < 30 mins !"
      };
    if (totalWorkDuration > 9 * HOUR && totalBreakTime < 45 * MINUTE)
      return {
        status: RULE_RESPECT_STATUS.failure,
        message: "Temps de pause < 45 mins !"
      };
  }
  return {
    status: RULE_RESPECT_STATUS.success,
    message: "Temps de pause respecté !"
  };
}

export function checkMinimumDurationOfWeeklyRest(
  nWorkedDays,
  longInnerBreaks,
  weekEnd,
  nextWeekStart
) {
  if (nWorkedDays > 6)
    return {
      status: RULE_RESPECT_STATUS.failure,
      message: "7 jours travaillés dans la semaine !"
    };

  const innerWeeklyRest = longInnerBreaks.find(
    b => b.duration >= DAY + LONG_BREAK_DURATION
  );
  const innerWeeklyRestDuration = innerWeeklyRest
    ? innerWeeklyRest.duration
    : 0;

  const checkOuterWeeklyRestAt = nextWeekStart || now();
  const outerWeeklyRestDuration = checkOuterWeeklyRestAt - weekEnd;
  if (
    !innerWeeklyRestDuration &&
    outerWeeklyRestDuration < DAY + LONG_BREAK_DURATION
  ) {
    if (nextWeekStart) {
      return {
        status: RULE_RESPECT_STATUS.failure,
        message: `Repos hebdomadaire trop court (${formatTimer(
          outerWeeklyRestDuration
        )}) !`
      };
    }
    return {
      status: RULE_RESPECT_STATUS.pending,
      message: `Repos hebdomadaire en cours (encore ${formatTimer(
        DAY + LONG_BREAK_DURATION - outerWeeklyRestDuration
      )})`
    };
  }

  const restDuration = Math.max(
    innerWeeklyRestDuration,
    outerWeeklyRestDuration
  );

  return {
    status: RULE_RESPECT_STATUS.success,
    message: `Repos hebdomadaire respecté (${
      restDuration > 48 * HOUR ? "> 48h" : formatTimer(restDuration)
    }) !`
  };
}
