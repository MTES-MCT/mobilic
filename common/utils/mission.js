import forEach from "lodash/forEach";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import { getTime, sortEvents } from "./events";
import { computeTeamChanges } from "./coworkers";

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

function computeMissionProperties(mission, userId, companies) {
  const company =
    mission.company || companies.find(c => c.id === mission.companyId);
  const activities = mission.allActivities.filter(a => a.userId === userId);
  return {
    company,
    activities,
    expenditures: mission.expenditures.filter(e => e.userId === userId),
    startTime:
      activities.length > 0 ? getTime(activities[0]) : getTime(mission),
    isComplete:
      activities.length > 0 && !!activities[activities.length - 1].endTime,
    endTime:
      activities.length > 0 ? activities[activities.length - 1].endTime : null,
    teamChanges: computeTeamChanges(mission.allActivities, userId),
    ended: mission.ended && activities.every(a => !!a.endTime),
    submittedBySomeoneElse: mission.submitter && mission.submitter.id !== userId
  };
}

export function augmentSortAndFilterMissions(missions, userId, companies = []) {
  return sortEvents(
    missions
      .map(m => ({ ...m, ...computeMissionProperties(m, userId, companies) }))
      .filter(m => m.activities.length > 0)
  );
}
