import { getTime } from "./events";
import {ACTIVITIES} from "./activities";

export function computeTotalActivityDurations(dayActivityEvents, until = null) {
  if (dayActivityEvents.length === 0) return {};
  const actualUntil =
    until || getTime(dayActivityEvents[dayActivityEvents.length - 1]);
  const firstEvent = dayActivityEvents[0];
  const timers = { total: actualUntil - getTime(firstEvent) };
  for (let i = 0; i < dayActivityEvents.length; i++) {
    const event = dayActivityEvents[i];
    const nextEventDate =
      i === dayActivityEvents.length - 1
        ? actualUntil
        : getTime(dayActivityEvents[i + 1]);
    const timeableType = event.type === ACTIVITIES.rest.name ? ACTIVITIES.break.name : event.type;
    timers[timeableType] = timers[timeableType]
      ? timers[timeableType] + nextEventDate - getTime(event)
      : nextEventDate - getTime(event);
  }
  return timers;
}
