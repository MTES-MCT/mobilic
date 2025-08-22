import React from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { makeStyles } from "@mui/styles";
import { useInfractions } from "./contextInfractions";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function ControlDrawer({
  isOpen,
  onClose,
  children,
  controlId = undefined
}) {
  const classes = useStyles();

  React.useEffect(() => {
    if (isOpen && controlId) {
      const previousTitle = document.title;
      document.title = `Contrôle #${controlId} - Mobilic`;
      return () => (document.title = previousTitle);
    }
  }, [isOpen, controlId]);

  const _useInfractions = useInfractions();

  const _onClose = () => {
    if (_useInfractions && _useInfractions.setIsReportingInfractions) {
      _useInfractions.setIsReportingInfractions(false);
    }
    onClose();
  };

  return (
    <SwipeableDrawer
      anchor="right"
      open={isOpen}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={_onClose}
      PaperProps={{
        className: classes.missionDrawer,
        sx: {
          width: { xs: "100vw", md: 860 }
        }
      }}
    >
      {children}
    </SwipeableDrawer>
  );
}
