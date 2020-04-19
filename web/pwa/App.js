import React from "react";
import {
  getActualActivityEvents,
  getTime,
  groupActivityEventsByDay,
  sortEvents
} from "common/utils/events";
import { ScreenWithBottomNavigation } from "./utils/navigation";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useActions } from "common/utils/actions";

function App() {
  const actions = useActions();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(Date.now()), 30000);
  }, []);

  const activityEvents = getActualActivityEvents(
    storeSyncedWithLocalStorage.activities(),
    storeSyncedWithLocalStorage.pendingActivityCancels(),
    storeSyncedWithLocalStorage.pendingActivityRevisions()
  );

  const activityEventsByDay = groupActivityEventsByDay(activityEvents);
  const previousDaysActivityEventsByDay = activityEventsByDay.slice(
    0,
    activityEventsByDay.length - 1
  );

  const currentDayActivityEvents =
    activityEventsByDay[activityEventsByDay.length - 1];
  const currentDayExpenditures =
    currentDayActivityEvents && currentDayActivityEvents.length > 0
      ? storeSyncedWithLocalStorage
          .expenditures()
          .filter(e => getTime(e) >= getTime(currentDayActivityEvents[0]))
      : [];

  const currentActivity = activityEvents[activityEvents.length - 1];
  let firstActivityOfCurrentOrLatestDay;
  if (currentDayActivityEvents && currentDayActivityEvents.length > 0) {
    firstActivityOfCurrentOrLatestDay = currentDayActivityEvents[0];
  } else if (
    previousDaysActivityEventsByDay &&
    previousDaysActivityEventsByDay.length > 0
  ) {
    firstActivityOfCurrentOrLatestDay =
      previousDaysActivityEventsByDay[
        previousDaysActivityEventsByDay.length - 1
      ][0];
  }

  const missions = sortEvents(storeSyncedWithLocalStorage.missions()).reverse();
  const currentOrLatestDayMission = firstActivityOfCurrentOrLatestDay
    ? missions.find(
        m => getTime(m) >= getTime(firstActivityOfCurrentOrLatestDay)
      )
    : null;

  const vehicleBookings = sortEvents(
    storeSyncedWithLocalStorage.vehicleBookings()
  ).reverse();
  const currentOrLatestDayVehicleBooking = firstActivityOfCurrentOrLatestDay
    ? vehicleBookings.find(
        vb => getTime(vb) >= getTime(firstActivityOfCurrentOrLatestDay)
      )
    : null;

  return (
    <ScreenWithBottomNavigation
      currentTime={currentTime}
      currentActivity={currentActivity}
      currentDayActivityEvents={currentDayActivityEvents}
      currentOrLatestDayMission={currentOrLatestDayMission}
      currentOrLatestDayVehicleBooking={currentOrLatestDayVehicleBooking}
      pushNewActivityEvent={actions.pushNewActivityEvent}
      cancelOrReviseActivityEvent={actions.cancelOrReviseActivityEvent}
      previousDaysActivityEventsByDay={previousDaysActivityEventsByDay}
      currentDayExpenditures={currentDayExpenditures}
      pushNewTeamEnrollment={actions.pushNewTeamEnrollment}
      pushNewMission={actions.pushNewMission}
      pushNewVehicleBooking={actions.pushNewVehicleBooking}
      pushNewExpenditure={actions.pushNewExpenditure}
      cancelExpenditure={actions.cancelExpenditure}
      pushNewComment={actions.pushNewComment}
    />
  );
}

export default App;
