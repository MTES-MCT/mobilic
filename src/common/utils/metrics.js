import { getTime } from "./events";

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
    timers[event.type] = timers[event.type]
      ? timers[event.type] + nextEventDate - getTime(event)
      : nextEventDate - getTime(event);
  }
  return timers;
}
