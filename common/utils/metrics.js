import { getTime } from "./events";
import { ACTIVITIES } from "./activities";
import { now } from "./time";

export function computeTotalActivityDurations(activityEvents) {
  const current = now();
  if (activityEvents.length === 0) return {};
  const actualUntil =
    activityEvents[activityEvents.length - 1].endTime || current;
  const firstEvent = activityEvents[0];
  const timers = { total: actualUntil - getTime(firstEvent) };
  activityEvents.forEach(event => {
    timers[event.type] =
      (timers[event.type] || 0) + (event.endTime || current) - getTime(event);
  });
  timers.totalWork =
    (timers[ACTIVITIES.work.name] || 0) +
    (timers[ACTIVITIES.drive.name] || 0) +
    (timers[ACTIVITIES.support.name] || 0);
  timers[ACTIVITIES.break.name] = timers.total - timers.totalWork;
  return timers;
}
