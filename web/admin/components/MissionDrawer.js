import React from "react";
import { MissionDetails } from "./MissionDetails/MissionDetails";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { makeStyles } from "@mui/styles";
import { useLocation } from "react-router-dom";
import { useModals } from "common/utils/modals";
import { Alert } from "@mui/material";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import {
  CANCEL_UPDATE_MISSION,
  OPEN_CANCEL_UPDATE_MISSION
} from "common/utils/matomoTags";
import { useMatomo } from "@datapunt/matomo-tracker-react";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

const MissionDrawerContext = React.createContext(() => {});

export function MissionDrawerContextProvider({
  children,
  setShouldRefreshData,
  refreshData
}) {
  const location = useLocation();
  const modals = useModals();

  const classes = useStyles();
  const [missionIdOnFocus, setMissionIdOnFocus] = React.useState(null);

  const adminStore = useAdminStore();
  const { trackEvent } = useMatomo();

  const handleCloseTab = ev => {
    if (
      adminStore.virtualActivities.length > 0 ||
      adminStore.virtualExpenditureActions.length > 0
    ) {
      ev.preventDefault();
      return (ev.returnValue =
        "Des modifications sur la mission n'ont pas été enregistrées. Voulez vous quitter?");
    }
  };

  React.useEffect(() => {
    window.addEventListener("beforeunload", handleCloseTab);
    return () => window.removeEventListener("beforeunload", handleCloseTab);
  }, [adminStore.virtualActivities, adminStore.virtualExpenditureActions]);

  const reset = (revert = false) => {
    adminStore.dispatch({
      type: ADMIN_ACTIONS.resetVirtual
    });
    if (revert) {
      adminStore.dispatch({
        type: ADMIN_ACTIONS.revertMissionToOriginalValues,
        payload: { missionId: missionIdOnFocus }
      });
    }
    setMissionIdOnFocus(null);
  };

  React.useEffect(() => {
    if (missionIdOnFocus) {
      adminStore.dispatch({
        type: ADMIN_ACTIONS.putAsideOriginalMissions,
        payload: { missionId: missionIdOnFocus }
      });
    }
  }, [missionIdOnFocus]);

  const onClose = () => {
    if (
      adminStore.virtualActivities.length > 0 ||
      adminStore.virtualExpenditureActions.length > 0
    ) {
      trackEvent(OPEN_CANCEL_UPDATE_MISSION);
      modals.open("confirmation", {
        title: "Êtes-vous sûr de vouloir fermer ?",
        confirmButtonLabel: "Fermer",
        cancelButtonLabel: "Annuler",
        content: (
          <Alert severity="warning">
            Si vous fermez cette mission, les modifications non validées seront
            perdues.
          </Alert>
        ),
        handleConfirm: () => {
          trackEvent(CANCEL_UPDATE_MISSION);
          reset(true);
        }
      });
    } else {
      reset();
    }
  };

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
        onClose={onClose}
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
          handleClose={onClose}
          setShouldRefreshActivityPanel={setShouldRefreshData}
          refreshData={refreshData}
        />
      </SwipeableDrawer>
      {children}
    </MissionDrawerContext.Provider>
  );
}

export const useMissionDrawer = () => React.useContext(MissionDrawerContext);
