import forEach from "lodash/forEach";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import { computeTeamChanges } from "./coworkers";
import uniqBy from "lodash/uniqBy";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import min from "lodash/min";
import max from "lodash/max";
import sum from "lodash/sum";
import { DAY, HOUR, now } from "./time";
import { ACTIVITIES, getCurrentActivityDuration } from "./activities";

export const MAX_NB_MONTHS_HISTORY = 3 * 12; // 3 years
export const DEFAULT_MONTH_RANGE_HISTORY = 2;

export const DEFAULT_LAST_ACTIVITY_TOO_LONG = 24 * HOUR;
export const DEFAULT_WORKER_VALIDATION_TIMEOUT = 10 * DAY;

export function parseMissionPayloadFromBackend(missionPayload, userId) {
  return {
    id: missionPayload.id,
    name: missionPayload.name,
    companyId: missionPayload.companyId,
    company: missionPayload.company,
    vehicle: missionPayload.vehicle,
    validation: getWorkerValidationForUser(missionPayload.validations, userId),
    adminValidation: missionPayload.validations
      ? missionPayload.validations.find(
          v => v.isAdmin && (!v.userId || v.userId === userId)
        )
      : null,
    context: missionPayload.context,
    startLocation: missionPayload.startLocation,
    endLocation: missionPayload.endLocation,
    ended: missionPayload.ended !== undefined ? missionPayload.ended : true,
    submitter: missionPayload.submitter || null
  };
}

const getWorkerValidationForUser = (validations, userId) =>
  validations?.find(
    v =>
      (!v.userId && v.submitterId === userId) ||
      (v.userId === userId && (!v.isAdmin || v.submitterId === v.userId))
  );

export function linkMissionsWithRelations(missions, relationMap) {
  const augmentedMissions = mapValues(missions, m => ({
    ...m,
    ...mapValues(relationMap, () => [])
  }));
  forEach(relationMap, (items, relationName) => {
    items.forEach(item => {
      const associatedMission = augmentedMissions[item.missionId];
      if (associatedMission) {
        associatedMission[relationName].push(item);
      }
    });
  });
  return values(augmentedMissions);
}

export function augmentMissionWithProperties(mission, userId, companies = []) {
  const company =
    mission.company || companies.find(c => c.id === mission.companyId);
  const activities = mission.allActivities.filter(a => a.userId === userId);
  // TODO remove debug log
  console.log(mission.name, mission.deletedAt);
  return {
    ...mission,
    company,
    activities,
    expenditures: mission.expenditures.filter(e => e.userId === userId),
    startTime:
      activities.length > 0 ? activities[0].startTime : mission.receptionTime,
    isComplete:
      mission.isDeleted ||
      (activities.length > 0 && !!activities[activities.length - 1].endTime),
    endTime: mission.isDeleted
      ? mission.deletedAt
      : activities.length > 0
      ? activities[activities.length - 1].endTime
      : null,
    teamChanges: computeTeamChanges(mission.allActivities, userId),
    ended:
      mission.isDeleted ||
      (mission.ended && activities.every(a => !!a.endTime)),
    submittedBySomeoneElse:
      mission.submitter && mission.submitter.id !== userId,
    lastActivityStartTime: activities[activities.length - 1]?.startTime
  };
}

export function augmentAndSortMissions(missions, userId, companies = []) {
  return missions
    .map(m => augmentMissionWithProperties(m, userId, companies))
    .sort((m1, m2) => m1.lastActivityStartTime - m2.lastActivityStartTime);
}

export function computeMissionStats(m, users) {
  const now1 = now();
  const activitiesWithUserId = m.activities
    .map(a => ({
      ...a,
      userId: a.userId || a.user.id,
      user: a.user || users.find(u => u.id === a.userId)
    }))
    .filter(a => users.find(u => u.id === a.userId))
    .filter(a => !!a.user);
  const members = uniqBy(
    activitiesWithUserId.map(a => a.user),
    u => u.id
  );
  const validatorIds = m.validations.map(v => v.userId);
  const adminValidatedForMemberIds = m.validations
    .filter(v => v.isAdmin)
    .map(v => v.userId);
  const validatedByAllMembers = members.every(user =>
    validatorIds.includes(user.id)
  );
  const validatedByAdminForAllMembers = members.every(user =>
    adminValidatedForMemberIds.includes(user.id)
  );
  const activitiesByUser = groupBy(
    activitiesWithUserId,
    a => a.userId || a.user.id
  );
  const adminGlobalValidation = m.validations
    ? m.validations.find(v => !v.userId)
    : {};

  const isComplete = activitiesWithUserId.every(a => !!a.endTime);
  const startTime = min(m.activities.map(a => a.startTime));
  const endTime = isComplete ? max(m.activities.map(a => a.endTime)) : null;

  const missionTooOld = startTime + DEFAULT_WORKER_VALIDATION_TIMEOUT < now();

  const userStats = mapValues(activitiesByUser, (activities, userId) => {
    const user = members.find(m => m.id.toString() === userId);
    const _activities = orderBy(activities, ["startTime", "endTime"]);
    const isComplete = _activities.every(a => !!a.endTime);
    const startTime = min(_activities.map(a => a.startTime));
    const lastActivity = _activities[_activities.length - 1];
    const lastActivityStartTime = lastActivity.startTime;
    const lastActivitySubmitterId = lastActivity.lastSubmitterId;
    const runningActivityStartTime = isComplete ? null : lastActivityStartTime;
    const endTime = isComplete ? max(_activities.map(a => a.endTime)) : null;
    const endTimeOrNow = endTime || now1;
    const transferDuration = sum(
      _activities
        .filter(a => a.type === ACTIVITIES.transfer.name)
        .map(a => (a.endTime || now1) - a.startTime)
    );
    const totalWorkDuration = sum(
      _activities.map(a => (a.endTime || now1) - a.startTime)
    );
    return {
      activities: _activities,
      user: user,
      startTime,
      runningActivityStartTime,
      endTime,
      endTimeOrNow,
      service: endTimeOrNow - startTime,
      totalWorkDuration: totalWorkDuration - transferDuration,
      transferDuration,
      isComplete: _activities.every(a => !!a.endTime),
      breakDuration: endTimeOrNow - startTime - totalWorkDuration,
      expenditures: m.expenditures.filter(e => e.userId.toString() === userId),
      adminValidation:
        m.validations.find(v => v.userId?.toString() === userId && v.isAdmin) ||
        adminGlobalValidation,
      workerValidation: getWorkerValidationForUser(m.validations, user?.id),
      lastActivitySubmitterId
    };
  });
  const missionNotUpdatedForTooLong = values(userStats).some(
    userStat =>
      userStat.runningActivityStartTime &&
      userStat.runningActivityStartTime < now() - DEFAULT_LAST_ACTIVITY_TOO_LONG
  );

  return {
    ...m,
    activities: activitiesWithUserId,
    startTime,
    endTime,
    endTimeOrNow: endTime || now1,
    isComplete,
    validatedByAllMembers,
    validatedByAdminForAllMembers,
    userStats,
    missionNotUpdatedForTooLong,
    missionTooOld,
    adminGlobalValidation
  };
}

export function missionCreatedByAdmin(mission, employments) {
  return employments.some(
    e =>
      e.hasAdminRights &&
      e.user?.id === mission.submitterId &&
      mission.companyId === e.companyId
  );
}

export function missionLastLessThanAMinute(mission) {
  return (
    mission.activities?.length === 1 &&
    getCurrentActivityDuration(mission.activities[0]) < 60
  );
}
