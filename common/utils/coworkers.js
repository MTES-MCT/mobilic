import { formatTimeOfDay } from "./time";

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
  return store
    .coworkers()
    .filter(
      cw =>
        !!cw.joinedCurrentMissionAt &&
        cw.joinedCurrentMissionAt <= time &&
        (!cw.leftCurrentMissionAt || cw.leftCurrentMissionAt >= time)
    );
}

export function formatLatestEnrollmentInfo(coworker) {
  return coworker.leftCurrentMissionAt
    ? `retiré à ${formatTimeOfDay(coworker.leftCurrentMissionAt)}`
    : coworker.joinedCurrentMissionAt
    ? `ajouté à ${formatTimeOfDay(coworker.joinedCurrentMissionAt)}`
    : "";
}
