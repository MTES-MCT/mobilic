import { ACTIVITIES } from "./activities";

export function groupEventsByDay(events) {
  const eventsByDay = [[]];
  let i = 0;
  events.forEach(event => {
    eventsByDay[i].push(event);
    if (event.type === ACTIVITIES.rest.name) {
      eventsByDay.push([]);
      i++;
    }
  });
  return eventsByDay;
}
