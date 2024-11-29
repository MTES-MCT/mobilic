import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlBulletin } from "./ControllerControlBulletin";
import Box from "@mui/material/Box";
import { useModals } from "common/utils/modals";
import { useInfractions } from "../../utils/contextInfractions";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function ControlBulletinDrawer({
  isOpen,
  onClose,
  onSaveControlBulletin
}) {
  const classes = useStyles();
  const { cancelInfractions, saveInfractions } = useInfractions();
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
          setMustConfirmBeforeClosing={setMustConfirmBeforeClosing}
          onSaveControlBulletin={onSaveControlBulletin}
          saveInfractions={() => saveInfractions({ showSuccessMessage: false })}
        />
      </Box>
    </SwipeableDrawer>
  ];
}
