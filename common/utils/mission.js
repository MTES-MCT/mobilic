import forEach from "lodash/forEach";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import { getTime } from "./events";
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
          v =>
            v.isAdmin &&
            (!v.userId || (v.userId === userId && v.submitterId !== userId))
        )
      : null,
    context: missionPayload.context,
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

export function computeMissionProperties(mission, userId) {
  return {
    startTime:
      mission.activities.length > 0
        ? getTime(mission.activities[0])
        : getTime(mission),
    isComplete:
      mission.activities.length > 0 &&
      !!mission.activities[mission.activities.length - 1].endTime,
    teamChanges: computeTeamChanges(mission.allActivities, userId)
  };
}
