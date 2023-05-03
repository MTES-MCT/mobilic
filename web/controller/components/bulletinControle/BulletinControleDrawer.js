import {
  Button,
  ButtonGroup,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle
} from "@dataesr/react-dsfr";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { ControllerControlBulletinControleLIC } from "./ControllerControlBulletinControleLIC";
import Box from "@mui/material/Box";

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
  onSavingBulletinControle,
  controlData
}) {
  const classes = useStyles();
  const [openModalCancel, setOpenModalCancel] = useState(false);
  const [mustConfirmBeforeClosing, setMustConfirmBeforeClosing] = useState(
    false
  );

  const closeDrawer = (forceClose = false) => {
    if (!forceClose && mustConfirmBeforeClosing) {
      setOpenModalCancel(true);
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
        <ControllerControlBulletinControleLIC
          bulletinControle={bulletinControle}
          onSavingBulletinControle={onSavingBulletinControle}
          onClose={closeDrawer}
          controlData={controlData}
          setMustConfirmBeforeClosing={setMustConfirmBeforeClosing}
        />
      </Box>
    </SwipeableDrawer>,
    <Modal
      key={2}
      isOpen={openModalCancel}
      hide={() => setOpenModalCancel(false)}
    >
      <ModalTitle>Confirmation d'annulation</ModalTitle>
      <ModalContent>
        En annulant ou en fermant sans enregistrer, vous perdrez les
        modifications effectuées.
        <br />
        Êtes-vous certain(e) de vouloir annuler ?
      </ModalContent>
      <ModalFooter>
        <ButtonGroup isInlineFrom="md" align="right">
          <Button
            title="Annuler"
            onClick={() => {
              setOpenModalCancel(false);
              setMustConfirmBeforeClosing(false);
              onClose();
            }}
          >
            Annuler
          </Button>
          <Button
            secondary
            title="Fermer"
            onClick={() => setOpenModalCancel(false)}
          >
            Revenir à mes modifications
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  ];
}
