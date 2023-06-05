import React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import classNames from "classnames";
import { ControllerControlHeader } from "../details/ControllerControlHeader";
import { ControllerControlNoLic } from "./ControllerControlNoLic";
import { ControlBulletinDrawer } from "../controlBulletin/ControlBulletinDrawer";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { ControllerControlNoLicPreliminaryForm } from "./ControllerControlNoLicPreliminaryForm";

const useStyles = makeStyles(theme => ({
  missionDrawer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export function ControllerControlNoLicDrawer({ isOpen, onClose }) {
  const classes = useStyles();

  const [isEditingBDC, setIsEditingBDC] = React.useState(false);
  const [controlData, setControlData] = React.useState(null);

  const editBDC = () => {
    setIsEditingBDC(true);
  };

  const closeControl = () => {
    setControlData(null);
    onClose();
  };

  return [
    <SwipeableDrawer
      key={0}
      anchor="right"
      open={isOpen}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={() => closeControl()}
      PaperProps={{
        className: classes.missionDrawer,
        sx: {
          width: { xs: "100vw", md: 860 }
        }
      }}
    >
      {controlData ? (
        <>
          <ControlBulletinDrawer
            isOpen={isEditingBDC}
            onClose={() => setIsEditingBDC(false)}
            controlData={controlData}
            onSaveControlBulletin={newData =>
              setControlData(prevControlData => ({
                ...prevControlData,
                ...newData
              }))
            }
          />
          <ControllerControlHeader
            controlId={controlData.id}
            controlDate={controlData.creationTime}
            onCloseDrawer={() => closeControl()}
          />
          <ControllerControlNoLic controlData={controlData} editBDC={editBDC} />
        </>
      ) : (
        <Container className={classes.controlHeaderContainer}>
          <Box marginBottom={2}>
            <Link
              to="#"
              className={classNames(
                classes.linkHomeMobile,
                "fr-link",
                "fr-fi-arrow-left-line",
                "fr-link--icon-left"
              )}
              onClick={() => closeControl()}
            >
              Fermer
            </Link>
          </Box>
          <ControllerControlNoLicPreliminaryForm
            setControlData={setControlData}
            onClose={() => closeControl()}
          />
        </Container>
      )}
    </SwipeableDrawer>
  ];
}
