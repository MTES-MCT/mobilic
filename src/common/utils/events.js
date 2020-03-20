import { ACTIVITIES } from "./activities";

export function getTime(event) {
  return event.startTime || event.actionTime || event.eventTime;
}

export function sortEvents(events) {
  return events.sort((event1, event2) => getTime(event1) - getTime(event2));
}

export function groupActivityEventsByDay(activityEvents) {
  const eventsByDay = [[]];
  let i = 0;
  sortEvents(activityEvents).forEach(event => {
    eventsByDay[i].push(event);
    if (event.type === ACTIVITIES.rest.name) {
      eventsByDay.push([]);
      i++;
    }
  });
  return eventsByDay;
}
