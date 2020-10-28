import { formatTimeOfDay } from "./time";
import { getTime } from "./events";
import map from "lodash/map";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import omitBy from "lodash/omitBy";

export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

export function resolveTeamAt(teamChanges, time) {
  const statusesAtTime = computeLatestEnrollmentStatuses(
    mapValues(teamChanges, statuses =>
      statuses.filter(s => getTime(s) <= time || s.isInStartingTeam)
    )
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

export function computeTeamChanges(allMissionSortedActivities, selfId) {
  const missionStart = Math.min(
    ...allMissionSortedActivities.map(a => getTime(a))
  );
  const missionEnd = allMissionSortedActivities.some(a => !a.endTime)
    ? null
    : Math.max(...allMissionSortedActivities.map(a => a.endTime));
  const startAndEndTimesForUser = {};
  allMissionSortedActivities.forEach(a => {
    const userTimes = startAndEndTimesForUser[a.userId] || {};
    if (
      !startAndEndTimesForUser[a.userId] ||
      userTimes.startTime > getTime(a)
    ) {
      userTimes.startTime = getTime(a);
    }
    if (
      !startAndEndTimesForUser[a.userId] ||
      !a.endTime ||
      (userTimes.endTime && userTimes.endTime < a.endTime)
    ) {
      userTimes.endTime = a.endTime;
    }
    startAndEndTimesForUser[a.userId] = userTimes;
  });
  return mapValues(startAndEndTimesForUser, (userTimes, userId) => {
    const statuses = [
      {
        userId: parseInt(userId),
        time: userTimes.startTime,
        isEnrollment: true,
        isInStartingTeam:
          userId === selfId.toString() || userTimes.startTime === missionStart
      }
    ];
    if (
      userTimes.endTime &&
      userId !== selfId.toString() &&
      (!missionEnd || userTimes.endTime < missionEnd)
    ) {
      statuses.push({
        userId: parseInt(userId),
        time: userTimes.endTime,
        isEnrollment: false
      });
    }
    return statuses;
  });
}

export function computeLatestEnrollmentStatuses(teamChanges) {
  return omitBy(
    map(teamChanges, userStatuses => userStatuses[userStatuses.length - 1]),
    value => !value
  );
}
