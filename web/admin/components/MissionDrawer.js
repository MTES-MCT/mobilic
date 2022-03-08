import React from "react";
import { MissionDetails } from "./MissionDetails/MissionDetails";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { makeStyles } from "@mui/styles";
import { useLocation } from "react-router-dom";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

const MissionDrawerContext = React.createContext(() => {});

export function MissionDrawerContextProvider({
  children,
  width,
  setShouldRefreshData
}) {
  const location = useLocation();

  const classes = useStyles();
  const [missionIdOnFocus, setMissionIdOnFocus] = React.useState(null);

  return (
    <MissionDrawerContext.Provider
      value={[missionIdOnFocus, setMissionIdOnFocus]}
    >
      <SwipeableDrawer
        anchor="right"
        open={!!missionIdOnFocus}
        disableSwipeToOpen
        disableDiscovery
        onOpen={() => {}}
        onClose={() => setMissionIdOnFocus(null)}
        PaperProps={{
          className: classes.missionDrawer,
          sx: {
            width: { xs: "100vw", md: 860 }
          }
        }}
      >
        <MissionDetails
          missionId={missionIdOnFocus}
          day={location.state ? location.state.day : null}
          handleClose={() => setMissionIdOnFocus(null)}
          setShouldRefreshActivityPanel={setShouldRefreshData}
        />
      </SwipeableDrawer>
      {children}
    </MissionDrawerContext.Provider>
  );
}

export const useMissionDrawer = () => React.useContext(MissionDrawerContext);
