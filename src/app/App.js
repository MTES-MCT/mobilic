import React from "react";
import { ACTIVITIES } from "../common/utils/activities";
import { groupEventsByDay } from "../common/utils/events";
import { ScreenWithBottomNavigation } from "../common/utils/navigation";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "../common/utils/theme";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MODAL_DICT, ModalProvider } from "./utils/modals";
import { useApi, USER_QUERY } from "../common/utils/api";
import { useStoreSyncedWithLocalStorage } from "../common/utils/storage";
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
    : ACTIVITIES.end.name;
  const currentTeamMates = currentActivity
    ? currentActivity.team.filter(
        tm => tm.id !== storeSyncedWithLocalStorage.userId
      )
    : [];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ModalProvider modalDict={MODAL_DICT}>
        <ScreenWithBottomNavigation
          currentActivityType={currentActivityType}
          currentDayActivityEvents={currentDayActivityEvents}
          teamMates={currentTeamMates}
          previousDaysEventsByDay={previousDaysEventsByDay}
          currentDayExpenditures={currentDayExpenditures}
        />
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
