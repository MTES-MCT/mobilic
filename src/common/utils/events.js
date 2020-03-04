import { ACTIVITIES } from "./activities";

export function groupEventsByDay(events) {
  const eventsByDay = [[]];
  let i = 0;
  events
    .sort((event1, event2) => event1.eventTime - event2.eventTime)
    .forEach(event => {
      eventsByDay[i].push(event);
      if (event.type === ACTIVITIES.rest.name) {
        eventsByDay.push([]);
        i++;
      }
    });
  return eventsByDay;
}
