import { getTime, sortEvents } from "./events";

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

function missionStartTime(mission) {
  if (mission.activities && mission.activities.length > 0) {
    return getTime(mission.activities[0]);
  } else return getTime(mission);
}

export function sortMissionEvents(store, mission, eventSubFields) {
  eventSubFields.forEach(field => {
    mission[field] = sortEvents(store.getLastVersion(mission[field]));
  });
}

export function sortMissions(missions) {
  return missions
    .map(m => ({ ...m, startTime: missionStartTime(m) }))
    .sort((mission1, mission2) => mission1.startTime - mission2.startTime);
}

export function groupSortedMissionsByPeriod(missions, getPeriod) {
  const periods = [];
  let currentPeriodIndex = -1;
  const missionsGroupedByPeriod = {};
  missions.forEach(mission => {
    const period = getPeriod(getTime(mission));
    if (currentPeriodIndex === -1 || period !== periods[currentPeriodIndex]) {
      if (currentPeriodIndex >= 0)
        missionsGroupedByPeriod[
          periods[currentPeriodIndex]
        ].followingPeriodStart = period;
      periods.push(period);
      currentPeriodIndex++;
      missionsGroupedByPeriod[period] = {
        followingPeriodStart: undefined,
        missions: []
      };
    }
    missionsGroupedByPeriod[period].missions.push(mission);
  });
  return { periods, missionsGroupedByPeriod };
}
