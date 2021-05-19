import { getTime } from "./events";
import { ACTIVITIES, filterActivitiesOverlappingPeriod } from "./activities";
import { now } from "./time";

export function computeTotalActivityDurations(
  activityEvents,
  fromTime,
  untilTime
) {
  const current = now();
  if (activityEvents.length === 0) return {};

  const filteredActivityEvents = filterActivitiesOverlappingPeriod(
    activityEvents,
    fromTime,
    untilTime
  );

  const actualUntil = Math.min(
    filteredActivityEvents[filteredActivityEvents.length - 1].endTime ||
      current,
    untilTime || current
  );

  const firstEvent = filteredActivityEvents[0];
  const timers = {
    total: actualUntil - Math.max(getTime(firstEvent), fromTime)
  };
  filteredActivityEvents.forEach(event => {
    timers[event.type] =
      (timers[event.type] || 0) +
      Math.min(event.endTime || current, untilTime || current) -
      Math.max(getTime(event), fromTime);
  });
  timers.totalWork =
    (timers[ACTIVITIES.work.name] || 0) +
    (timers[ACTIVITIES.drive.name] || 0) +
    (timers[ACTIVITIES.support.name] || 0);
  timers[ACTIVITIES.break.name] = timers.total - timers.totalWork;
  return timers;
}
