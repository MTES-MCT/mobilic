import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlBulletinControle } from "./ControllerControlBulletinControle";
import Box from "@mui/material/Box";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function BulletinControleDrawer({
  isOpen,
  onClose,
  controlData,
  onSaveControlBulletin
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
        <ControllerControlBulletinControle
          onClose={closeDrawer}
          controlData={controlData}
          setMustConfirmBeforeClosing={setMustConfirmBeforeClosing}
          onSaveControlBulletin={onSaveControlBulletin}
        />
      </Box>
    </SwipeableDrawer>
  ];
}
