import React from 'react';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';


export default function BottomNavBar ({ screens, currentScreen, setCurrentScreen }) {
  return (
    <React.Fragment>
        <BottomNavigation
          value={currentScreen}
          onChange={(event, newValue) => {
            setCurrentScreen(newValue);
          }}
          showLabels
          className="nav-bar-container"
        >
            {Object.values(screens).map((screen) =>
                <BottomNavigationAction key={screen.name} label={screen.label} value={screen.name} icon={screen.renderIcon()} />
            )}
        </BottomNavigation>
    </React.Fragment>
  );
}

