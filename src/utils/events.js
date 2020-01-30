import {ACTIVITIES} from "./activities";
import stringify from "csv-stringify/lib/sync";
import {formatDay, formatTimer, MILLISECONDS_IN_A_DAY} from "./time";
import {share} from "./share";
import {computeTotalActivityDurations} from "./metrics";
import {formatCoworkerName} from "./coworkers";
import {EXPENDITURES} from "./expenditures";


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

function formatEventsAsLogs (events) {
    return events.map((event) => {
        const utcDateString = new Date(event.date).toISOString();
        return ({
            date: utcDateString,
            activity: event.activityName,
            team: event.team
        })
    });
}

function formatEventsAsDaySummary (dayEvents) {
    const timers = computeTotalActivityDurations(dayEvents);
    const dayStartString = new Date(dayEvents[0].date).toISOString();
    const dayEndString = new Date(dayEvents[dayEvents.length - 1].date).toISOString();
    const team = dayEvents[0].team;
    const expenditures = dayEvents[dayEvents.length - 1].currentDayExpenditures;

    const daySummary = {
        employe: "Moi",
        jour: dayStartString.slice(0, 10),
        debut: dayStartString,
        fin: dayEndString,
        conduite: formatTimer(timers[ACTIVITIES.drive.name] || 1),
        autre_tache: formatTimer(timers[ACTIVITIES.work.name] || 1),
        repos: formatTimer(timers[ACTIVITIES.rest.name] || 1),
        frais: Object.keys(EXPENDITURES).flatMap((expType) => expenditures[expType] ? [EXPENDITURES[expType].label] : []).join(" + ")
    };

    return [
        daySummary,
        ...team.map((teamMate) => ({
            ...daySummary,
            employe: formatCoworkerName(teamMate)
        }))
    ];
}

export function shareEvents (eventsByDays, stringifyFunc=(data) => stringify(data, {header: true})) {
    const firstDay = eventsByDays[0][0].date;
    const lastDay = eventsByDays[eventsByDays.length - 1][0].date;
    const areAllEventsOnTheSameDay = (lastDay - firstDay) < MILLISECONDS_IN_A_DAY;

    const title = `Temps de travail du ${formatDay(firstDay)}${(areAllEventsOnTheSameDay ? "" : " au " + formatDay(lastDay))}`
    const text = stringifyFunc(
        eventsByDays.flatMap(formatEventsAsDaySummary)
    );
    share(text, title);
}
