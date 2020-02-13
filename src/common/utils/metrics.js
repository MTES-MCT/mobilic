export function computeTotalActivityDurations(dayEvents, until = null) {
  if (dayEvents.length === 0) return {};
  const actualUntil = until || dayEvents[dayEvents.length - 1].eventTime;
  const firstEvent = dayEvents[0];
  const timers = { total: actualUntil - firstEvent.eventTime };
  for (let i = 0; i < dayEvents.length; i++) {
    const event = dayEvents[i];
    const nextEventDate =
      i === dayEvents.length - 1 ? actualUntil : dayEvents[i + 1].eventTime;
    timers[event.type] = timers[event.type]
      ? timers[event.type] + nextEventDate - event.eventTime
      : nextEventDate - event.eventTime;
  }
  return timers;
}
