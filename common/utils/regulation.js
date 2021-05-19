import { formatTimer, HOUR, LONG_BREAK_DURATION, now } from "./time";

export const RULE_RESPECT_STATUS = {
  success: "success",
  failure: "failure",
  pending: "pending"
};

export function checkDayRestRespect(dayEnd, followingDayStart) {
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
