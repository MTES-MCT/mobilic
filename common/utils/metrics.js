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

  const firstActivity = filteredActivityEvents[0];
  const timers = {
    total: actualUntil - Math.max(firstActivity.startTime, fromTime)
  };
  filteredActivityEvents.forEach(activity => {
    timers[activity.type] =
      (timers[activity.type] || 0) +
      Math.min(activity.endTime || current, untilTime || current) -
      Math.max(activity.startTime, fromTime);
  });
  timers.totalWork =
    (timers[ACTIVITIES.work.name] || 0) +
    (timers[ACTIVITIES.drive.name] || 0) +
    (timers[ACTIVITIES.support.name] || 0);
  timers.transfer = timers[ACTIVITIES.transfer.name] || 0;
  timers[ACTIVITIES.break.name] =
    timers.total - timers.totalWork - timers.transfer;
  return timers;
}
