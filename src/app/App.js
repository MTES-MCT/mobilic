import React from "react";
import { ACTIVITIES } from "../common/utils/activities";
import { currentTeamMates } from "../common/utils/coworkers";
import { groupEventsByDay } from "../common/utils/events";
import { ScreenWithBottomNavigation } from "../common/utils/navigation";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "../common/utils/theme";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MODAL_DICT, ModalProvider } from "./utils/modals";
import { useApi, USER_QUERY } from "../common/utils/api";
import { useLocalStorage } from "../common/utils/storage";

function App() {
  const api = useApi();
  const localStorageContext = useLocalStorage();

  const [currentDayExpenditures, setCurrentDayExpenditures] = React.useState(
    {}
  );
  const [activityEvents, setActivityEvents] = React.useState([]);
  const [currentDate, setCurrentDate] = React.useState(Date.now());
  const [coworkers, setCoworkers] = React.useState([]);

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentDate(Date.now()), 5000);
  }, []);

  React.useEffect(() => {
    async function onAppStart() {
      try {
        const userData = await api.graphQlQuery(USER_QUERY, {
          id: localStorageContext.getUserId()
        });
        const { firstName, lastName } = userData.data.user;
        localStorageContext.setName({ firstName, lastName });
      } catch (err) {
        console.log(err);
      }
    }
    onAppStart();
  }, [api, localStorageContext]);

  const teamMates = currentTeamMates(coworkers);
  const eventsByDay = groupEventsByDay(activityEvents);
  const previousDaysEventsByDay = eventsByDay.slice(0, eventsByDay.length - 1);
  const currentActivityName = activityEvents[activityEvents.length - 1]
    ? activityEvents[activityEvents.length - 1].activityName
    : ACTIVITIES.end.name;

  function pushNewEvent(activityName) {
    if (activityName === currentActivityName) return;
    setActivityEvents([
      ...activityEvents,
      {
        activityName: activityName,
        date: Date.now(),
        team: teamMates,
        currentDayExpenditures: currentDayExpenditures
      }
    ]);
    if (activityName === ACTIVITIES.end.name) {
      setCurrentDayExpenditures({});
      clearTeam();
    }
  }

  function clearTeam() {
    const newCoworkers = coworkers.slice();
    newCoworkers.forEach(coworker => {
      coworker.isInCurrentTeam = false;
    });
    setCoworkers(newCoworkers);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ModalProvider modalDict={MODAL_DICT}>
        <ScreenWithBottomNavigation
          currentActivityName={currentActivityName}
          currentDayEvents={eventsByDay[eventsByDay.length - 1]}
          pushNewCurrentDayEvent={pushNewEvent}
          teamMates={teamMates}
          previousDaysEventsByDay={previousDaysEventsByDay}
          clearTeam={clearTeam}
          currentDayExpenditures={currentDayExpenditures}
          setCurrentDayExpenditures={setCurrentDayExpenditures}
          coworkers={coworkers}
          setCoworkers={setCoworkers}
        />
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
