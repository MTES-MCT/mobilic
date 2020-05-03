import React from "react";
import {
  groupActivityEventsByDay,
  sortEvents
} from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useActions } from "common/utils/actions";

function App({ ScreenComponent }) {
  const actions = useActions();
  const store = useStoreSyncedWithLocalStorage();

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(Date.now()), 30000);
  }, []);

  const activityEvents = store.getArray("activities");

  const activityEventsByDay = groupActivityEventsByDay(activityEvents);
  const previousDaysActivityEventsByDay = activityEventsByDay.slice(
    0,
    activityEventsByDay.length - 1
  );

  const currentDayActivityEvents =
    activityEventsByDay[activityEventsByDay.length - 1];

  const currentActivity = activityEvents[activityEvents.length - 1];
  const missions = sortEvents(store.getArray("missions")).reverse();
  const latestMission = missions.length > 0 ? missions[0] : null;

  const vehicleBookingsForLatestMission = latestMission
    ? sortEvents(
      store.getArray("vehicleBookings").filter(vb => (vb.missionId === latestMission.id) || !vb.missionId)
    ).reverse()
    : [];

  console.log(vehicleBookingsForLatestMission);
  const currentVehicleBookingForLatestMission = vehicleBookingsForLatestMission.length > 0 ? vehicleBookingsForLatestMission[0] : null;

  return (
    <ScreenComponent
      currentTime={currentTime}
      currentActivity={currentActivity}
      currentDayActivityEvents={currentDayActivityEvents}
      latestMission={latestMission}
      currentVehicleBookingForLatestMission={currentVehicleBookingForLatestMission}
      pushNewActivityEvent={actions.pushNewActivityEvent}
      editActivityEvent={actions.editActivityEvent}
      previousDaysActivityEventsByDay={previousDaysActivityEventsByDay}
      pushNewTeamEnrollmentOrRelease={actions.pushNewTeamEnrollmentOrRelease}
      beginNewMission={actions.beginNewMission}
      pushNewVehicleBooking={actions.pushNewVehicleBooking}
      pushNewComment={actions.pushNewComment}
      endMission={actions.endMission}
    />
  );
}

export default App;
