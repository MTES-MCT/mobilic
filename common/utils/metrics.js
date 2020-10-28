import { getTime } from "./events";
import { ACTIVITIES } from "./activities";

export function computeTotalActivityDurations(activityEvents, until = null) {
  if (activityEvents.length === 0) return {};
  const actualUntil =
    until || activityEvents[activityEvents.length - 1].endTime;
  const firstEvent = activityEvents[0];
  const timers = { total: actualUntil - getTime(firstEvent) };
  activityEvents.forEach(event => {
    timers[event.type] =
      (timers[event.type] || 0) + event.endTime - getTime(event);
  });
  timers.totalWork =
    (timers[ACTIVITIES.work.name] || 0) +
    (timers[ACTIVITIES.drive.name] || 0) +
    (timers[ACTIVITIES.support.name] || 0);
  timers[ACTIVITIES.break.name] = timers.total - timers.totalWork;
  return timers;
}
