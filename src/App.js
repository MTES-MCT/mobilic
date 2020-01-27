import React from 'react';
import './App.css';
import {ACTIVITIES} from "./utils/activities";
import {TeamSelectionModal} from "./components/TeamSelection";
import {SelectFirstActivityModal} from "./components/FirstActivitySelection";
import {currentTeamMates} from "./utils/coworkers";
import {groupEventsByDay} from "./utils/events";
import {ScreenWithBottomNavigation} from "./utils/navigation";


function App() {
  const [activityEvents, setActivityEvents] = React.useState([]);
  const [currentDate, setCurrentDate] = React.useState(Date.now());
  const [coworkers, setCoworkers] = React.useState([]);
  const [openTeamSelectionModal, setOpenTeamSelectionModal] = React.useState(false);

  React.useEffect(
      () => {setInterval(() => setCurrentDate(Date.now()), 5000)}, []
  );

  const teamMates = currentTeamMates(coworkers);
  const eventsByDay = groupEventsByDay(activityEvents);
  const previousDaysEvents = eventsByDay.slice(0, eventsByDay.length - 1);
  const currentActivityName = activityEvents[activityEvents.length - 1] ? activityEvents[activityEvents.length - 1].activityName : ACTIVITIES.end.name;
  const [openFirstActivityModal, setOpenFirstActivityModal] = React.useState(false);


  function pushNewEvent (activityName) {
      if (activityName === currentActivityName) return;
      setActivityEvents([
          ...activityEvents,
          {
              activityName: activityName,
              date: Date.now(),
              team: teamMates
          }
      ]);
  }

  const clearTeam = () => {
    const newCoworkers = coworkers.slice();
    newCoworkers.forEach((coworker) => {
        coworker.isInCurrentTeam = false;
    });
    setCoworkers(newCoworkers);
  };

  return (
    <div className="App">
        <ScreenWithBottomNavigation
            currentActivityName={currentActivityName}
            currentDayEvents={eventsByDay[eventsByDay.length - 1]}
            pushNewCurrentDayEvent={pushNewEvent}
            setOpenTeamSelectionModal={setOpenTeamSelectionModal}
            teamMates={teamMates}
            previousDaysEvents={previousDaysEvents}
            setOpenFirstActivityModal={setOpenFirstActivityModal}
            clearTeam={clearTeam}
        />
        <TeamSelectionModal
            open={openTeamSelectionModal}
            handleBack={() => setOpenTeamSelectionModal(false)}
            handleContinue={() => {
                setOpenTeamSelectionModal(false);
                currentActivityName === ACTIVITIES.end.name && setOpenFirstActivityModal(true)}
            }
            coworkers={coworkers}
            setCoworkers={setCoworkers}
        />
        <SelectFirstActivityModal
            open={openFirstActivityModal}
            handleClose={() => setOpenFirstActivityModal(false)}
            handleItemClick={(activity) => pushNewEvent(activity)}
        />
    </div>
  );
}

export default App;
