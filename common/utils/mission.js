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

export function parseMissionPayloadFromBackend(missionPayload, userId) {
  return {
    id: missionPayload.id,
    name: missionPayload.name,
    companyId: missionPayload.companyId,
    company: missionPayload.company,
    vehicle: missionPayload.vehicle,
    validation: missionPayload.validations
      ? missionPayload.validations.find(v => v.submitterId === userId)
      : null,
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
  return {
    ...mission,
    company,
    activities,
    expenditures: mission.expenditures.filter(e => e.userId === userId),
    startTime:
      activities.length > 0 ? activities[0].startTime : mission.receptionTime,
    isComplete:
      activities.length > 0 && !!activities[activities.length - 1].endTime,
    endTime:
      activities.length > 0 ? activities[activities.length - 1].endTime : null,
    teamChanges: computeTeamChanges(mission.allActivities, userId),
    ended: mission.ended && activities.every(a => !!a.endTime),
    submittedBySomeoneElse: mission.submitter && mission.submitter.id !== userId
  };
}

export function augmentAndSortMissions(missions, userId, companies = []) {
  return missions
    .map(m => augmentMissionWithProperties(m, userId, companies))
    .sort((m1, m2) => m1.startTime - m2.startTime);
}

export function computeMissionStats(m, users) {
  const activitiesWithUserId = m.activities
    .map(a => ({
      ...a,
      userId: a.userId || a.user.id,
      user: a.user || users.find(u => u.id === a.userId)
    }))
    .filter(a => !!a.user);
  const members = uniqBy(
    activitiesWithUserId.map(a => a.user),
    u => u.id
  );
  const validatorIds = m.validations.map(v => v.submitterId);
  const validatedByAllMembers = members.every(user =>
    validatorIds.includes(user.id)
  );
  const activitiesByUser = groupBy(
    activitiesWithUserId,
    a => a.userId || a.user.id
  );
  const isComplete = activitiesWithUserId.every(a => !!a.endTime);
  const userStats = mapValues(activitiesByUser, (activities, userId) => {
    const _activities = orderBy(activities, ["startTime", "endTime"]);
    const startTime = min(_activities.map(a => a.startTime));
    const endTime = max(_activities.map(a => a.endTime));
    const totalWorkDuration = sum(
      _activities.map(a => a.endTime - a.startTime)
    );
    return {
      activities: _activities,
      user: members.find(m => m.id.toString() === userId),
      startTime,
      endTime,
      service: endTime - startTime,
      totalWorkDuration,
      isComplete: _activities.every(a => !!a.endTime),
      breakDuration: endTime - startTime - totalWorkDuration,
      expenditures: m.expenditures,
      expenditureAggs: mapValues(
        groupBy(
          m.expenditures.filter(e => e.userId.toString() === userId),
          e => e.type
        ),
        exps => exps.length
      ),
      validation: m.validations.find(v => v.submitterId.toString() === userId)
    };
  });
  const startTime = min(m.activities.map(a => a.startTime));
  const endTime = max(m.activities.map(a => a.endTime));
  return {
    ...m,
    activities: activitiesWithUserId,
    startTime,
    endTime,
    isComplete,
    validatedByAllMembers,
    userStats,
    adminValidation: m.validations ? m.validations.find(v => v.isAdmin) : {}
  };
}
