import {ACTIVITIES} from "./activities";

export function groupEventsByDay (events) {
    const eventsByDay = [[]];
    let i = 0;
    events.forEach((event) => {
        eventsByDay[i].push(event);
        if (event.activityName === ACTIVITIES.end.name) {
            eventsByDay.push([]);
            i++;
        }
    });
    return eventsByDay;
}
