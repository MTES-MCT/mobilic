import {ACTIVITIES} from "./activities";

export function getCurrentDayEvents (events) {
    if (events.length === 0) return [];
    let i;
    for (i = events.length - 1; i >= 0; i--) {
        const event = events[i];
        if (event.activityName === ACTIVITIES.end.name) {
            break;
        }
    }
    return events.slice(i + 1);
}

export function groupEventsByDay (events) {
    if (events.length === 0) return [];
    const eventsByDay = [[]];
    let i = 0;
    events.forEach((event) => {
        eventsByDay[i].push(event);
        if (event.activityName === ACTIVITIES.end.name && i < events.length - 1) {
            eventsByDay.push([]);
            i++;
        }
    });
    return eventsByDay;
}
