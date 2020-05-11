import React from "react";
import { groupActivityEventsByDay, sortEvents } from "common/utils/events";
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

  const currentDayActivityEvents =
    activityEventsByDay[activityEventsByDay.length - 1];

  const currentActivity = activityEvents[activityEvents.length - 1];
  const missions = store.getArray("missions");
  const currentMission = currentActivity
    ? missions.find(
        m =>
          m.id === currentActivity.missionId ||
          (!m.id && !currentActivity.missionId)
      )
    : null;

  const currentMissionActivities = currentMission
    ? currentDayActivityEvents.filter(
        a =>
          a.missionId === currentMission.id ||
          (!a.missionId && !currentMission.id)
      )
    : [];

  const vehicleBookingsForCurrentMission = currentMission
    ? sortEvents(
        store
          .getArray("vehicleBookings")
          .filter(vb => vb.missionId === currentMission.id || !vb.missionId)
      ).reverse()
    : [];

  const currentVehicleBooking =
    vehicleBookingsForCurrentMission.length > 0
      ? vehicleBookingsForCurrentMission[0]
      : null;

  return (
    <ScreenComponent
      currentTime={currentTime}
      currentActivity={currentActivity}
      currentDayActivityEvents={currentDayActivityEvents}
      currentMission={currentMission}
      currentMissionActivities={currentMissionActivities}
      currentVehicleBooking={currentVehicleBooking}
      pushNewActivityEvent={actions.pushNewActivityEvent}
      editActivityEvent={actions.editActivityEvent}
      activityEventsByDay={activityEventsByDay}
      pushNewTeamEnrollmentOrRelease={actions.pushNewTeamEnrollmentOrRelease}
      beginNewMission={actions.beginNewMission}
      pushNewVehicleBooking={actions.pushNewVehicleBooking}
      pushNewComment={actions.pushNewComment}
      endMission={actions.endMission}
      validateMission={actions.validateMission}
    />
  );
}

export default App;
