import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlHeader } from "../details/ControllerControlHeader";
import { now } from "common/utils/time";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { DEFAULT_BC_NO_LIC } from "../../utils/bulletinControle";
import { BulletinControleDrawer } from "../bulletinControle/BulletinControleDrawer";
import { useLoadingScreen } from "common/utils/loading";
import { CONTROLLER_SAVE_CONTROL_BULLETIN } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}));

export function ControllerControlNoLicDrawer({ isOpen, onClose }) {
  const classes = useStyles();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  const [isEditingBC, setIsEditingBC] = React.useState(true);
  const [bulletinControle, setBulletinControle] = React.useState(
    DEFAULT_BC_NO_LIC
  );
  const [controlId, setControlId] = React.useState(undefined);

  const editBC = () => {
    setIsEditingBC(true);
  };

  const syncBulletin = async newBulletinControle =>
    withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_CONTROL_BULLETIN,
          {
            controlId: controlId,
            userFirstName: newBulletinControle.firstName,
            userLastName: newBulletinControle.lastName
          },
          { context: { nonPublicApi: true } }
        );
        const resultControlId =
          apiResponse.data.controllerSaveControlBulletin.id;
        setControlId(resultControlId);
        setBulletinControle(newBulletinControle);
      } catch (err) {
        console.log("error");
      }
    });

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
          onSavingBulletinControle={async newBulletinControle => {
            await syncBulletin(newBulletinControle);
            setIsEditingBC(false);
          }}
        />
        <ControllerControlHeader
          controlId={controlId}
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
