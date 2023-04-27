import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React from "react";
import { makeStyles } from "@mui/styles";
import { BulletinControleHeader } from "./BulletinControleHeader";
import { ControllerControlBulletinControle } from "./ControllerControlBulletinControle";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function BulletinControleDrawer({
  isOpen,
  onClose,
  bulletinControle,
  onSavingBulletinControle
}) {
  const classes = useStyles();

  return [
    <SwipeableDrawer
      key={0}
      anchor="right"
      open={isOpen}
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
      <BulletinControleHeader onCloseDrawer={onClose} />
      <ControllerControlBulletinControle
        bulletinControle={bulletinControle}
        onSavingBulletinControle={onSavingBulletinControle}
        onClose={onClose}
      />
    </SwipeableDrawer>
  ];
}
