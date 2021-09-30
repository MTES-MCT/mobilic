export function sortEvents(events) {
  return events.sort(
    (event1, event2) => event1.receptionTime - event2.receptionTime
  );
}
