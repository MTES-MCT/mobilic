import { formatTimeOfDay } from "./time";
import { getTime } from "./events";
import map from "lodash/map";
import groupBy from "lodash/groupBy";

export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

export function getCoworkerById(id, coworkers) {
  for (let i = 0; i < coworkers.length; i++) {
    const cw = coworkers[i];
    if (cw.id && id === cw.id) return cw;
  }
}

export function resolveTeamAt(teamChanges, time) {
  const statusesAtTime = computeLatestEnrollmentStatuses(
    teamChanges.filter(tc => getTime(tc) <= time)
  );
  return statusesAtTime.filter(tc => tc.isEnrollment).map(tc => tc.coworker);
}

export function formatLatestEnrollmentStatus(teamChange) {
  return !teamChange.isEnrollment
    ? `retiré à ${formatTimeOfDay(getTime(teamChange))}`
    : `ajouté à ${formatTimeOfDay(getTime(teamChange))}`;
}

export function computeLatestEnrollmentStatuses(missionTeamChanges) {
  return map(
    groupBy(missionTeamChanges, tc => tc.coworker.id),
    statuses => statuses[statuses.length - 1]
  );
}
