import { formatTimeOfDay } from "./time";
import { getTime } from "./events";
import map from "lodash/map";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import omitBy from "lodash/omitBy";
import { ACTIVITIES } from "./activities";

export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

export function resolveTeamAt(teamChanges, time) {
  const statusesAtTime = computeLatestEnrollmentStatuses(
    mapValues(teamChanges, statuses => statuses.filter(s => getTime(s) <= time))
  );
  return values(statusesAtTime)
    .filter(tc => tc.isEnrollment)
    .map(tc => tc.userId);
}

export function formatLatestEnrollmentStatus(teamChange) {
  return !teamChange.isEnrollment
    ? `retiré(e) à ${formatTimeOfDay(getTime(teamChange))}`
    : `ajouté(e) à ${formatTimeOfDay(getTime(teamChange))}`;
}

export function computeTeamChanges(allMissionSortedActivities) {
  const statuses = {};
  allMissionSortedActivities.forEach(a => {
    const currentUserStatus = statuses[a.userId]
      ? statuses[a.userId][statuses[a.userId].length - 1]
      : null;
    if (!currentUserStatus) statuses[a.userId] = [];
    if (
      !currentUserStatus ||
      (a.type !== ACTIVITIES.rest.name) !== currentUserStatus.isEnrollment
    ) {
      statuses[a.userId].push({
        userId: a.userId,
        time: getTime(a),
        isEnrollment: a.type !== ACTIVITIES.rest.name
      });
    }
  });
  return statuses;
}

export function computeLatestEnrollmentStatuses(teamChanges) {
  return omitBy(
    map(teamChanges, userStatuses => userStatuses[userStatuses.length - 1]),
    value => !value
  );
}
