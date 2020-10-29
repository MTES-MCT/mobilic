import { formatTimer, HOUR, now } from "./time";

export const RULE_RESPECT_STATUS = {
  success: "success",
  failure: "failure",
  pending: "pending"
};

export function checkDayRestRespect(dayEnd, followingDayStart) {
  const checkDayRestAt = followingDayStart ? followingDayStart : now();
  const ruleRespected = checkDayRestAt - dayEnd >= 10 * HOUR;
  if (ruleRespected) {
    return {
      status: RULE_RESPECT_STATUS.success,
      message: "Repos journalier respecté !"
    };
  } else if (followingDayStart) {
    return {
      status: RULE_RESPECT_STATUS.failure,
      message: "Repos journalier trop court !"
    };
  }
  return {
    status: RULE_RESPECT_STATUS.pending,
    message: `Repos journalier en cours (encore au moins ${formatTimer(
      10 * HOUR - (checkDayRestAt - dayEnd)
    )}) !`
  };
}
