export function computeTotalActivityDurations(dayEvents, until = null) {
  if (dayEvents.length === 0) return {};
  const actualUntil = until || dayEvents[dayEvents.length - 1].date;
  const firstEvent = dayEvents[0];
  const timers = { total: actualUntil - firstEvent.date };
  for (let i = 0; i < dayEvents.length; i++) {
    const event = dayEvents[i];
    const nextEventDate =
      i === dayEvents.length - 1 ? actualUntil : dayEvents[i + 1].date;
    timers[event.activityName] = timers[event.activityName]
      ? timers[event.activityName] + nextEventDate - event.date
      : nextEventDate - event.date;
  }
  return timers;
}
