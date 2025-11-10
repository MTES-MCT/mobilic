import React from "react";
import { MissionDetails } from "../components/MissionDetails/MissionDetails";
import { useLocation } from "react-router-dom";
import { useModals } from "common/utils/modals";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import {
  CANCEL_UPDATE_MISSION,
  OPEN_CANCEL_UPDATE_MISSION
} from "common/utils/matomoTags";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import Notice from "../../common/Notice";
import { Drawer } from "./Drawer";

const MissionDrawerContext = React.createContext(() => {});

export function MissionDrawerContextProvider({
  children,
  setShouldRefreshData,
  refreshData
}) {
  const location = useLocation();
  const modals = useModals();

  const [missionIdOnFocus, setMissionIdOnFocus] = React.useState(null);

  const adminStore = useAdminStore();
  const { trackEvent } = useMatomo();

  const handleCloseTab = (ev) => {
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
          <Notice
            type="warning"
            description="Si vous fermez cette mission, les modifications non validées seront
            perdues."
          />
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
      <Drawer
        open={!!missionIdOnFocus}
        onClose={onClose}
        zIndex={1505}
        id="mission-drawer"
      >
        <MissionDetails
          missionId={missionIdOnFocus}
          day={location.state ? location.state.day : null}
          handleClose={onClose}
          setShouldRefreshActivityPanel={setShouldRefreshData}
          refreshData={refreshData}
        />
      </Drawer>
      {children}
    </MissionDrawerContext.Provider>
  );
}

export const useMissionDrawer = () => React.useContext(MissionDrawerContext);
