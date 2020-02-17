import React from "react";
import {
  ACTIVITIES,
  parseActivityPayloadFromBackend
} from "../common/utils/activities";
import { groupEventsByDay } from "../common/utils/events";
import { ScreenWithBottomNavigation } from "./utils/navigation";
import { ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ACTIVITY_LOG_MUTATION, useApi } from "../common/utils/api";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";
import { loadUserData } from "../common/utils/loadUserData";

function App() {
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();

  const [currentDate, setCurrentDate] = React.useState(Date.now());

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentDate(Date.now()), 5000);
  }, []);

  React.useEffect(() => {
    loadUserData(api, storeSyncedWithLocalStorage);
    return () => {};
  }, []);

  const activityEvents = storeSyncedWithLocalStorage.activities();
  const activityEventsByDay = groupEventsByDay(activityEvents);
  const previousDaysEventsByDay = activityEventsByDay.slice(
    0,
    activityEventsByDay.length - 1
  );

  const currentDayActivityEvents =
    activityEventsByDay[activityEventsByDay.length - 1];
  const currentDayExpenditures =
    currentDayActivityEvents && currentDayActivityEvents.length > 0
      ? storeSyncedWithLocalStorage
          .expenditures()
          .filter(e => e.eventTime >= currentDayActivityEvents[0].eventTime)
      : [];

  const currentActivity = activityEvents[activityEvents.length - 1];

  const pushNewActivityEvent = ({
    activityType,
    team,
    driverIdx = null,
    mission = currentActivity && currentActivity.mission,
    vehicleRegistrationNumber = currentActivity &&
      currentActivity.vehicleRegistrationNumber
  }) => {
    storeSyncedWithLocalStorage.pushNewActivity(
      activityType,
      team,
      mission,
      vehicleRegistrationNumber,
      driverIdx,
      async () => {
        try {
          const activitiesToSubmit = storeSyncedWithLocalStorage.activitiesPendingSubmission();
          const activitySubmit = await api.graphQlMutate(
            ACTIVITY_LOG_MUTATION,
            { data: activitiesToSubmit }
          );
          const activities = activitySubmit.data.logActivities.activities;
          storeSyncedWithLocalStorage.setActivities(
            activities.map(parseActivityPayloadFromBackend)
          );
          const coworkers = activitySubmit.data.logActivities.company.users;
          storeSyncedWithLocalStorage.setCoworkers(coworkers);
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  return (
    <ScreenWithBottomNavigation
      currentActivity={currentActivity}
      currentDayActivityEvents={currentDayActivityEvents}
      pushNewActivityEvent={pushNewActivityEvent}
      previousDaysEventsByDay={previousDaysEventsByDay}
      currentDayExpenditures={currentDayExpenditures}
    />
  );
}

export default App;
