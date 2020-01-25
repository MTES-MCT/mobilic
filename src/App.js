import React from 'react';
import './App.css';
import BottomNavBar from "./components/BottomNavBar";
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';
import {computeTotalActivityDurations} from "./utils/activityPeriods";
import {CurrentActivity} from "./screens/CurrentActivity";
import {ACTIVITIES} from "./utils/activities";
import {BeforeWork} from "./screens/BeforeWork";



const NAV_SCREENS = [
    {
        name: "item1",
        text: "Test",
        renderIcon: (props) => <MenuIcon {...props} />
    },
    {
        name: "item2",
        text: "Test",
        renderIcon: (props) => <SearchIcon {...props} />
    },
    {
        name: "item3",
        text: "Test",
        renderIcon: (props) => <MoreIcon {...props} />
    }
];


function App() {
  const [currentTab, setCurrentTab] = React.useState("item1");
  const [currentDayEvents, setCurrentDayEvents] = React.useState([]);
  const [currentDate, setCurrentDate] = React.useState(Date.now());

  React.useEffect(
      () => {setInterval(() => setCurrentDate(Date.now()), 5000)}, []
  );

  function pushNewCurrentDayEvent (activityName) {
      setCurrentDayEvents([
          ...currentDayEvents,
          {
              activityName: activityName,
              date: Date.now()
          }
      ]);
  }

  const currentActivity = currentDayEvents[currentDayEvents.length - 1] ? currentDayEvents[currentDayEvents.length - 1].activityName : ACTIVITIES.end.name;

  const timers = computeTotalActivityDurations(currentDayEvents, Date.now() + 1);

  return (
    <div className="App">
        {currentActivity === ACTIVITIES.end.name ?
            <BeforeWork
                previousDayTimers={timers}
                previousDayStart={currentDayEvents[0] && currentDayEvents[0].date}
                previousDayEnd={currentDayEvents[currentDayEvents.length - 1] && currentDayEvents[currentDayEvents.length - 1].date}
                pushFirstActivity={pushNewCurrentDayEvent}
            />
            :
            <CurrentActivity
                currentActivity={currentActivity}
                timers={timers}
                currentDayEvents={currentDayEvents}
                pushNewCurrentDayEvent={pushNewCurrentDayEvent}
            />
        }
        <BottomNavBar screens={NAV_SCREENS} currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
