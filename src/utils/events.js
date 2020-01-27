import {ACTIVITIES} from "./activities";
import stringify from "csv-stringify/lib/sync";
import {formatDay, MILLISECONDS_IN_A_DAY} from "./time";
import {share} from "./share";


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

export function preFormatEvents (events) {
    return events.map((event) => {
        const utcDateString = new Date(event.date).toISOString();
        return ({
            day: utcDateString.slice(0, 10),
            time: utcDateString.slice(11, 16),
            activity: event.activityName,
            team: event.team
        })
    });
}

export function shareEvents (events, stringifyFunc=stringify) {
    const firstDay = events[0].date;
    const lastDay = events[events.length - 1].date;
    const areAllEventsOnTheSameDay = (lastDay - firstDay) < MILLISECONDS_IN_A_DAY;

    const title = `Temps de travail du ${formatDay(firstDay)}${(areAllEventsOnTheSameDay ? "" : " au " + formatDay(lastDay))}`
    const text = stringifyFunc(
        preFormatEvents(events)
    );
    share(text, title);
}
