import React from "react";
import "./App.css";
import { ACTIVITIES } from "./utils/activities";
import { currentTeamMates } from "./utils/coworkers";
import { groupEventsByDay } from "./utils/events";
import { ScreenWithBottomNavigation } from "./utils/navigation";
import { ThemeProvider } from "@material-ui/core/styles";
import { theme } from "./utils/theme";
import CssBaseline from "@material-ui/core/CssBaseline";
import { MODAL_DICT, ModalProvider } from "./utils/modals";

function App() {
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
        <div className="App">
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
        </div>
      </ModalProvider>
    </ThemeProvider>
  );
}

export default App;
