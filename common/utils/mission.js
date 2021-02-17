import forEach from "lodash/forEach";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import { getTime, sortEvents } from "./events";
import { computeTeamChanges } from "./coworkers";

export function parseMissionPayloadFromBackend(missionPayload, userId) {
  return {
    id: missionPayload.id,
    name: missionPayload.name,
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
    ended: missionPayload.ended !== undefined ? missionPayload.ended : true
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

function computeMissionProperties(mission, userId) {
  const activities = mission.allActivities.filter(a => a.userId === userId);
  return {
    activities,
    expenditures: mission.expenditures.filter(e => e.userId === userId),
    startTime:
      activities.length > 0 ? getTime(activities[0]) : getTime(mission),
    isComplete:
      activities.length > 0 && !!activities[activities.length - 1].endTime,
    endTime:
      activities.length > 0 ? activities[activities.length - 1].endTime : null,
    teamChanges: computeTeamChanges(mission.allActivities, userId)
  };
}

export function augmentSortAndFilterMissions(missions, userId) {
  console.log(missions);
  console.log(userId);
  return sortEvents(
    missions
      .map(m => ({ ...m, ...computeMissionProperties(m, userId) }))
      .filter(m => m.activities.length > 0)
  );
}
