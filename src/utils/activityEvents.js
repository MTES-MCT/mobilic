export function computeDayTimers (dayEvents, until) {
    if (dayEvents.length === 0) return {};
    const firstEvent = dayEvents[0];
    const timers = {total: until - firstEvent.date};
    for (let i = 0; i < dayEvents.length; i++) {
        const event = dayEvents[i];
        const nextEventDate = (i === dayEvents.length - 1) ? until : dayEvents[i + 1].date;
        timers[event.activity] = timers[event.activity] ? timers[event.activity] + nextEventDate - event.date : nextEventDate - event.date;
    }
    return timers;
}
