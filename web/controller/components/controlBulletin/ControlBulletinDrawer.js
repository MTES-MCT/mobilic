import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlBulletin } from "./ControllerControlBulletin";
import Box from "@mui/material/Box";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function ControlBulletinDrawer({
  isOpen,
  onClose,
  controlData,
  onSaveControlBulletin,
  groupedAlerts,
  saveInfractions,
  onUpdateInfraction,
  cancelInfractions
}) {
  const classes = useStyles();
  const [mustConfirmBeforeClosing, setMustConfirmBeforeClosing] = useState(
    false
  );
  const modals = useModals();

  const closeDrawer = (forceClose = false) => {
    if (!forceClose && mustConfirmBeforeClosing) {
      modals.open("confirmationCancelControlBulletinModal", {
        confirmButtonLabel: "Revenir à mes modifications",
        handleCancel: () => {
          cancelInfractions({ forceCancel: true });
          onClose();
        },
        handleConfirm: () => {}
      });
    } else {
      onClose();
    }
  };

  return [
    <SwipeableDrawer
      key={0}
      anchor="right"
      open={isOpen}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={() => closeDrawer()}
      PaperProps={{
        className: classes.missionDrawer,
        sx: {
          width: { xs: "100vw", md: 860 }
        }
      }}
    >
      <Box m={2}>
        <ControllerControlBulletin
          onClose={closeDrawer}
          controlData={controlData}
          setMustConfirmBeforeClosing={setMustConfirmBeforeClosing}
          onSaveControlBulletin={onSaveControlBulletin}
          groupedAlerts={groupedAlerts}
          saveInfractions={() => saveInfractions({ showSuccessMessage: false })}
          onUpdateInfraction={onUpdateInfraction}
        />
      </Box>
    </SwipeableDrawer>
  ];
}
