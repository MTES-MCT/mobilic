import React from 'react';
import './App.css';
import BottomNavBar from "./components/BottomNavBar";
import Container from '@material-ui/core/Container';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import BuildIcon from '@material-ui/icons/Build';
import HotelIcon from '@material-ui/icons/Hotel';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import {ActivitySwitchGrid} from "./components/ActivitySwitch";
import {TimeOfService} from "./components/TimeOfService";
import {computeDayTimers} from "./utils/activityEvents";


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


const ACTIVITY_SWITCHES= [
    {
        name: "drive",
        label: "Conduite",
        renderIcon: (props) => <LocalShippingIcon {...props} />
    },
    {
        name: "work",
        label: "Travail",
        renderIcon: (props) => <BuildIcon {...props} />,
    },
    {
        name: "rest",
        label: "Repos",
        renderIcon: (props) => <HotelIcon {...props} />
    },
    {
        name: "end",
        label: "Fin de journée",
        renderIcon: (props) => <HighlightOffIcon {...props} />
    }
];


function App() {
  const [currentTab, setCurrentTab] = React.useState("item1");
  const [currentActivity, setCurrentActivity] = React.useState("drive");
  const [currentDayEvents, setCurrentDayEvents] = React.useState([]);
  const [currentDate, setCurrentDate] = React.useState(Date.now());

  React.useEffect(
      () => {setInterval(() => setCurrentDate(Date.now()), 5000)}, []
  );

  function pushNewCurrentDayEvent (event) {
      setCurrentDayEvents([
          ...currentDayEvents,
          event
      ]);
  }

  const timers = computeDayTimers(currentDayEvents, Date.now() + 1);
  return (
    <div className="App">
        <Container >
            <TimeOfService timer={timers["total"]} />
            <ActivitySwitchGrid
                activitySwitches={ACTIVITY_SWITCHES}
                timers={timers}
                activityOnFocus={currentActivity}
                setActivityOnFocus={setCurrentActivity}
                pushActivitySwitchEvent={pushNewCurrentDayEvent}
            />
        </Container>
        <BottomNavBar screens={NAV_SCREENS} currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
