import React from "react";
import { isWidthUp } from "@material-ui/core";
import { MissionDetails } from "./MissionDetails";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import makeStyles from "@material-ui/core/styles/makeStyles";
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
        onOpen={() => {}}
        onClose={() => setMissionIdOnFocus(null)}
        PaperProps={{
          className: classes.missionDrawer,
          style: {
            width: isWidthUp("md", width) ? 800 : "100vw"
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
