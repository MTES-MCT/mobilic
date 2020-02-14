import React from "react";
import {
  ACTIVITIES,
  parseActivityPayloadFromBackend
} from "../common/utils/activities";
import { groupEventsByDay } from "../common/utils/events";
import { ScreenWithBottomNavigation } from "../common/utils/navigation";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "../common/utils/theme";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MODAL_DICT, ModalProvider } from "./utils/modals";
import { ACTIVITY_LOG_MUTATION, useApi, USER_QUERY } from "../common/utils/api";
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
  const currentActivityType = currentActivity
    ? currentActivity.type
    : ACTIVITIES.rest.name;
  const currentTeamMates = currentActivity
    ? storeSyncedWithLocalStorage
        .coworkers()
        .filter(
          cw =>
            cw.id !== storeSyncedWithLocalStorage.userId &&
            currentActivity.team.map(tm => tm.id).includes(cw.id)
        )
    : [];

  const pushNewActivityEvent = (activityType, team = []) => {
    storeSyncedWithLocalStorage.pushNewActivity(
      activityType,
      team,
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
        } catch (err) {
          console.log(err);
        }
      }
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ModalProvider modalDict={MODAL_DICT}>
        <ScreenWithBottomNavigation
          currentActivityType={currentActivityType}
          currentDayActivityEvents={currentDayActivityEvents}
          teamMates={currentTeamMates}
          pushNewActivityEvent={pushNewActivityEvent}
          previousDaysEventsByDay={previousDaysEventsByDay}
          currentDayExpenditures={currentDayExpenditures}
        />
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
