export function getTime(event) {
  return (
    event.userTime || event.startTime || event.actionTime || event.eventTime
  );
}

export function sortEvents(events) {
  return events.sort((event1, event2) => getTime(event1) - getTime(event2));
}
