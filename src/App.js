import React from 'react';
import './App.css';
import BottomNavBar from "./components/BottomNavBar";
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';


const NAV_SCREENS = [
    {
        name: "item1",
        text: "Test",
        icon: MenuIcon
    },
    {
        name: "item2",
        text: "Test",
        icon: SearchIcon
    },
    {
        name: "item3",
        text: "Test",
        icon: MoreIcon
    }
];


function App() {
  const [currentTab, setCurrentTab] = React.useState("item1");
  return (
    <div className="App">
        <BottomNavBar screens={NAV_SCREENS} currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default App;
