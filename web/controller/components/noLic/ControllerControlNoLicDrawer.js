import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlHeader } from "../details/ControllerControlHeader";
import { now } from "common/utils/time";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { DEFAULT_BC_NO_LIC } from "../../utils/bulletinControle";
import { BulletinControleDrawer } from "../bulletinControle/BulletinControleDrawer";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function ControllerControlNoLicDrawer({ isOpen, onClose }) {
  const classes = useStyles();

  const [isEditingBC, setIsEditingBC] = React.useState(true);
  const [bulletinControle, setBulletinControle] = React.useState(
    DEFAULT_BC_NO_LIC
  );

  const editBC = () => {
    setIsEditingBC(true);
  };

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
      <>
        <BulletinControleDrawer
          isOpen={isEditingBC}
          onClose={() => setIsEditingBC(false)}
          bulletinControle={bulletinControle}
          onSavingBulletinControle={newBulletinControle => {
            setBulletinControle(newBulletinControle);
            setIsEditingBC(false);
          }}
        />
        <ControllerControlHeader
          controlId="XXX"
          controlDate={now()}
          onCloseDrawer={onClose}
        />
        <ControllerControlNoLic
          bulletinControle={bulletinControle}
          editBC={editBC}
        />
      </>
    </SwipeableDrawer>
  ];
}
