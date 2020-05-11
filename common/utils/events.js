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
  const eventsByDay = [];
  let i = -1;
  let missionJustFinishedTime = 1;
  sortEvents(activityEvents).forEach(event => {
    if (
      missionJustFinishedTime &&
      new Date(getTime(event)).toISOString().slice(0, 10) !==
        new Date(missionJustFinishedTime).toISOString().slice(0, 10)
    ) {
      eventsByDay.push([]);
      i++;
    }
    missionJustFinishedTime = null;
    eventsByDay[i].push(event);
    if (event.type === ACTIVITIES.rest.name) {
      missionJustFinishedTime = getTime(event);
    }
  });
  return eventsByDay;
}

export function groupDayActivityEventsByPeriod(eventsByDay, periodCompute) {
  const periods = [];
  let currentPeriodIndex = -1;
  const eventsGroupedByPeriod = {};
  eventsByDay.forEach(dayEvents => {
    const period = periodCompute(getTime(dayEvents[0]));
    if (currentPeriodIndex === -1 || period !== periods[currentPeriodIndex]) {
      if (currentPeriodIndex >= 0)
        eventsGroupedByPeriod[
          periods[currentPeriodIndex]
        ].followingPeriodStart = period;
      periods.push(period);
      currentPeriodIndex++;
      eventsGroupedByPeriod[period] = {
        followingPeriodStart: undefined,
        events: []
      };
    }
    eventsGroupedByPeriod[period].events.push(dayEvents);
  });
  return { periods, eventsGroupedByPeriod };
}
