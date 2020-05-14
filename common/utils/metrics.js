import { getTime } from "./events";
import { ACTIVITIES } from "./activities";

export function computeTotalActivityDurations(activityEvents, until = null) {
  if (activityEvents.length === 0) return {};
  const actualUntil =
    until || getTime(activityEvents[activityEvents.length - 1]);
  const firstEvent = activityEvents[0];
  const timers = { total: actualUntil - getTime(firstEvent) };
  for (let i = 0; i < activityEvents.length; i++) {
    const event = activityEvents[i];
    const nextEventDate =
      i === activityEvents.length - 1
        ? actualUntil
        : getTime(activityEvents[i + 1]);
    const timeableType =
      event.type === ACTIVITIES.rest.name ? ACTIVITIES.break.name : event.type;
    timers[timeableType] = timers[timeableType]
      ? timers[timeableType] + nextEventDate - getTime(event)
      : nextEventDate - getTime(event);
  }
  timers.totalWork =
    (timers[ACTIVITIES.work.name] || 0) + (timers[ACTIVITIES.drive.name] || 0);
  return timers;
}
