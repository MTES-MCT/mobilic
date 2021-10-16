import maxBy from "lodash/maxBy";
import fromPairs from "lodash/fromPairs";
import values from "lodash/values";
import forEach from "lodash/forEach";
import { ACTIVITIES_AND_EXPENDITURES_HISTORY_ON_MISSION_QUERY } from "./apiQueries";

function versionOfEventAt(event, time) {
  if (event.receptionTime && event.receptionTime > time) return null;
  if (event.dismissedAt && event.dismissedAt <= time) return null;
  if (
    event.lastUpdateTime &&
    event.lastUpdateTime > time &&
    event.versions &&
    event.versions.length > 0
  ) {
    const versionAtTime =
      maxBy(
        event.versions.filter(v => v.receptionTime <= time),
        v => v.receptionTime
      ) || {};
    return { ...event, ...versionAtTime };
  }
  return event;
}

function getChangesPerEventSinceTime(currentEvents, eventsWithHistory, time) {
  let changesPerEventId = fromPairs(
    currentEvents.map(a => [a.id.toString(), { current: a }])
  );

  eventsWithHistory.forEach(event => {
    if (!changesPerEventId[event.id.toString()]) {
      changesPerEventId[event.id.toString()] = {
        current: event.dismissedAt ? null : event
      };
    }
    const eventChanges = changesPerEventId[event.id.toString()];

    const currentVersion = eventChanges.current;
    const previousVersion = versionOfEventAt(event, time);
    let changeType = null;
    let changeTime = null;

    if (previousVersion || currentVersion) {
      if (!previousVersion) {
        changeType = "CREATE";
        changeTime = currentVersion.receptionTime;
      } else if (!currentVersion) {
        changeType = "DELETE";
        changeTime = previousVersion.dismissedAt;
      } else if (
        currentVersion.startTime !== previousVersion.endTime ||
        currentVersion.endTime !== previousVersion.endTime
      ) {
        changeType = "UPDATE";
      }
    }

    eventChanges.previous = previousVersion;
    eventChanges.change = changeType;
    eventChanges.time = event.lastUpdateTime || changeTime;
  });

  return changesPerEventId;
}

export function getEventVersionsAtTime(currentEvents, eventsWithHistory, time) {
  const changesPerEvent = getChangesPerEventSinceTime(
    currentEvents,
    eventsWithHistory,
    time
  );

  return values(changesPerEvent)
    .map(x => {
      if (!x.change) return x.current;
      return x.previous;
    })
    .filter(Boolean);
}

export function getChangesHistory(changesPerEvent) {
  const changesHistory = [];
  forEach(changesPerEvent, x => {
    if (x.change) changesHistory.push(x);
  });
  return changesHistory.sort((c1, c2) => c1.time - c2.time);
}

export async function getContradictoryInfoForMission(mission, api, store) {
  if (!mission.contradictoryInfo) {
    const contradictoryInfo = (
      await api.graphQlMutate(
        ACTIVITIES_AND_EXPENDITURES_HISTORY_ON_MISSION_QUERY,
        { missionId: mission.id }
      )
    ).data.mission;
    store.updateEntityObject({
      objectId: mission.id,
      entity: "missions",
      update: { contradictoryInfo }
    });
    store.batchUpdateStore();
    mission.contradictoryInfo = contradictoryInfo;
  }
  return mission.contradictoryInfo;
}
