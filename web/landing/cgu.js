import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import { makeStyles } from "@mui/styles";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { Header } from "../common/Header";
import Container from "@mui/material/Container";
import { usePageTitle } from "../common/UsePageTitle";
import Modal from "../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  frameContainer: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    margin: "auto",
    height: "40vh"
  }
}));

export function CGU() {
  return (
    <>
      <Header />
      <CGUContent />
    </>
  );
}

function CGUContent() {
  usePageTitle("CGU - Mobilic");
  const classes = useStyles();

  return (
    <Container className={classes.frameContainer} maxWidth={false}>
      <iframe
        title="Conditions Générales d'Utilisation"
        src="https://cgu.mobilic.beta.gouv.fr"
        frameBorder="0"
        width="100%"
        height="100%"
        style={{ backgroundColor: "transparent" }}
      ></iframe>
    </Container>
  );
}

function CGUModal({ open, handleClose, handleAccept, handleReject }) {
  const store = useStoreSyncedWithLocalStorage();

  return (
    <Modal
      size="lg"
      open={open}
      handleClose={handleClose}
      title="Conditions générales d'utilisation"
      content={<CGUContent />}
      actions={
        <>
          {handleReject && (
            <LoadingButton
              priority="secondary"
              onClick={async () => {
                if (handleReject) await handleReject();
                handleClose();
              }}
            >
              Refuser
            </LoadingButton>
          )}
          {!handleReject && (
            <Button priority="secondary" onClick={handleClose}>
              Fermer
            </Button>
          )}
          {handleAccept && (
            <LoadingButton
              onClick={async () => {
                await handleAccept();
                await store.setHasAcceptedCgu();
                handleClose();
              }}
            >
              Accepter
            </LoadingButton>
          )}
        </>
      }
    />
  );
}

export default CGUModal;
