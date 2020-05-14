import forEach from "lodash/forEach";
import mapValues from "lodash/mapValues";
import values from "lodash/values";
import { getTime } from "./events";
import { ACTIVITIES } from "./activities";

export function parseMissionPayloadFromBackend(missionPayload) {
  return {
    id: missionPayload.id,
    name: missionPayload.name,
    eventTime: missionPayload.eventTime,
    validated: missionPayload.validated,
    expenditures: missionPayload.expenditures
      ? JSON.parse(missionPayload.expenditures)
      : {}
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

export function computeMissionProperties(mission) {
  return {
    startTime:
      mission.activities.length > 0
        ? getTime(mission.activities[0])
        : getTime(mission),
    isComplete:
      mission.activities.length > 0 &&
      mission.activities[mission.activities.length - 1].type ===
        ACTIVITIES.rest.name
  };
}
