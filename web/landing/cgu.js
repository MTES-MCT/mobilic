import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { Header } from "../common/Header";
import Container from "@mui/material/Container";
import { usePageTitle } from "../common/UsePageTitle";
import Modal from "../common/Modal";

const useStyles = makeStyles(theme => ({
  frameContainer: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    margin: "auto",
    height: "100%"
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
      fullHeight
      open={open}
      handleClose={handleClose}
      title="Conditions générales d'utilisation"
      content={<CGUContent />}
      actions={
        <>
          {handleAccept && (
            <LoadingButton
              aria-label="Accepter"
              variant="contained"
              color="primary"
              onClick={async () => {
                await handleAccept();
                await store.setHasAcceptedCgu();
                handleClose();
              }}
            >
              Accepter
            </LoadingButton>
          )}
          {handleAccept && (
            <LoadingButton
              aria-label="Refuser"
              variant="outlined"
              color="primary"
              onClick={async () => {
                if (handleReject) await handleReject();
                handleClose();
              }}
            >
              Refuser
            </LoadingButton>
          )}
          {!handleAccept && (
            <Button
              aria-label="Fermer"
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Fermer
            </Button>
          )}
        </>
      }
    />
  );
}

export default CGUModal;
