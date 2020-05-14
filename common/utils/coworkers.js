import { formatTimeOfDay } from "./time";
import { getTime } from "./events";

export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

export function getCoworkerById(id, coworkers) {
  for (let i = 0; i < coworkers.length; i++) {
    const cw = coworkers[i];
    if (cw.id && id === cw.id) return cw;
  }
}

export function resolveTeamAt(store, time) {
  return [];
}

export function formatLatestEnrollmentStatus(teamChange) {
  return !teamChange.isEnrollment
    ? `retiré à ${formatTimeOfDay(getTime(teamChange))}`
    : `ajouté à ${formatTimeOfDay(getTime(teamChange))}`;
}
