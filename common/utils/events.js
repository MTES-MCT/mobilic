import { ACTIVITIES } from "./activities";

export function getTime(event) {
  return (
    event.userTime || event.startTime || event.actionTime || event.eventTime
  );
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

export function getActualActivityEvents(
  rawActivityEvents,
  activityCancels,
  activityRevisions
) {
  const cancelledActivityIds = activityCancels.map(ac => ac.eventId);
  return rawActivityEvents
    .filter(a => !cancelledActivityIds.includes(a.id) && !a.isHidden)
    .map(a => {
      const revision = activityRevisions.find(rev => rev.eventId === a.id);
      return revision ? { ...a, userTime: revision.userTime } : a;
    });
}
