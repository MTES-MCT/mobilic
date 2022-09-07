import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlDetails } from "./ControllerControlDetails";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function ControllerControlDrawer({ controlId, onClose }) {
  const classes = useStyles();

  return [
    <SwipeableDrawer
      key={0}
      anchor="right"
      open={!!controlId}
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
      <ControllerControlDetails controlId={controlId} onClose={onClose} />
    </SwipeableDrawer>
  ];
}
