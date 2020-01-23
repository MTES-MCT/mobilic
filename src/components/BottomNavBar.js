import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';


const useStyles = makeStyles(theme => ({
  root: {
      width: "100vw",
      justifyContent: "space-between",
      position: "fixed",
      bottom: 0,
  }
}));


export default function BottomNavBar ({ screens, currentTab, setCurrentTab }) {
  const classes = useStyles();

  return (
    <React.Fragment>
        <BottomNavigation
          value={currentTab}
          onChange={(event, newValue) => {
            setCurrentTab(newValue);
          }}
          showLabels
          className={classes.root}
        >
            {screens.map((screen) =>
                <BottomNavigationAction label={screen.text} value={screen.name} icon={<screen.icon />} />
            )}
        </BottomNavigation>
        <BottomNavigation />
    </React.Fragment>
  );
}

