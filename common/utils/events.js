import { now } from "./time";

function getTime(event) {
  return event.startTime || event.receptionTime || event.time;
}

export function getCurrentActivityDuration(activity) {
  const activitySwitchTime = activity.endTime || activity.startTime;
  return Math.max(now() - activitySwitchTime, 0);
}

export function sortEvents(events) {
  return events.sort((event1, event2) => getTime(event1) - getTime(event2));
}

export function getActivityStartTimeToUse(
  latestActivity,
  latestActivitySwitchExactTime
) {
  const latestActivitySwitchTime =
    latestActivity.endTime || latestActivity.startTime;
  const switchTimeDelta = latestActivitySwitchExactTime
    ? latestActivitySwitchExactTime - latestActivitySwitchTime
    : 0;
  return latestActivitySwitchExactTime &&
    switchTimeDelta >= 0 &&
    switchTimeDelta <= 60
    ? latestActivitySwitchExactTime
    : latestActivitySwitchTime;
}
