import maxBy from "lodash/maxBy";
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

export function getEventChangesSinceTime(eventsWithHistory, time) {
  return eventsWithHistory.map(event => {
    const currentVersion = event.dismissedAt ? null : event;
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
        currentVersion.startTime !== previousVersion.startTime ||
        currentVersion.endTime !== previousVersion.endTime
      ) {
        changeType = "UPDATE";
      }
    }

    const changeSubmitter =
      event.dismissAuthor ||
      (event.versions && event.versions.length > 0
        ? maxBy(event.versions, v => v.receptionTime).submitter
        : event.submitter);

    return {
      previous: previousVersion,
      current: currentVersion,
      change: changeType,
      time: event.lastUpdateTime || changeTime,
      submitter: changeSubmitter,
      submitterId: changeSubmitter.id,
      userId: event.user ? event.user.id : event.userId
    };
  });
}

export function getPreviousVersionsOfEvents(eventChanges) {
  return eventChanges
    .map(x => {
      if (!x.change) return x.current;
      return x.previous;
    })
    .filter(Boolean);
}

export function getChangesHistory(eventChanges) {
  const changesHistory = [];
  eventChanges.forEach(x => {
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
    store.batchUpdate();
    mission.contradictoryInfo = contradictoryInfo;
  }
  return mission.contradictoryInfo;
}
