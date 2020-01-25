import React from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';


export default function BottomNavBar ({ screens, currentTab, setCurrentTab }) {
  return (
    <React.Fragment>
        <BottomNavigation
          value={currentTab}
          onChange={(event, newValue) => {
            setCurrentTab(newValue);
          }}
          showLabels
          className="nav-bar-container"
        >
            {screens.map((screen) =>
                <BottomNavigationAction key={screen.name} label={screen.text} value={screen.name} icon={screen.renderIcon()} />
            )}
        </BottomNavigation>
    </React.Fragment>
  );
}

