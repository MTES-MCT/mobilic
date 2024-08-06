import React from "react";
import { Button } from "@dataesr/react-dsfr";
import Modal, { modalStyles } from "../../common/Modal";
import { Typography } from "@mui/material";

export default function BlockedTimeModal({ open, handleClose }) {
  const classes = modalStyles();
  const title = (
    <>
      <span
        className={`fr-icon-warning-fill ${classes.warningIcon}`}
        aria-hidden="true"
      ></span>
      La saisie de temps a été désactivée
    </>
  );
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={title}
      content={
        <>
          <Typography>
            La saisie de temps est suspendue. L'entreprise à laquelle vous êtes
            rattaché n'a pas désigné de gestionnaire.
          </Typography>
          <Typography>
            Si vous souhaitez continuer à enregistrer du temps de travail, nous
            vous invitons à contacter votre employeur.
          </Typography>
        </>
      }
      actions={
        <Button onClick={handleClose} className={classes.button}>
          J'ai compris
        </Button>
      }
    />
  );
}
