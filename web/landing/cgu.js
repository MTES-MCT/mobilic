import React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import { makeStyles } from "@mui/styles";
import { useIsWidthDown } from "common/utils/useWidth";
import Button from "@mui/material/Button";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { CustomDialogActions } from "../common/CustomDialogTitle";
import { Header } from "../common/Header";
import Container from "@mui/material/Container";

const useStyles = makeStyles(theme => ({
  frameContainer: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(1),
    margin: "auto",
    height: "100%"
  }
}));

export function CGU() {
  return [<Header key={0} />, <CGUContent key={1} />];
}

function CGUContent() {
  const classes = useStyles();

  return (
    <Container className={classes.frameContainer} maxWidth={false}>
      <iframe
        title="Conditions Générales d'Utilisation"
        src="https://cgu.mobilic.beta.gouv.fr"
        frameBorder="0"
        width="100%"
        height="100%"
        allowTransparency
      ></iframe>
    </Container>
  );
}

function CGUModal({ open, handleClose, handleAccept, handleReject }) {
  const store = useStoreSyncedWithLocalStorage();
  const isSmDown = useIsWidthDown("sm");

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      scroll="paper"
      fullWidth
      fullScreen={isSmDown}
      maxWidth="lg"
      PaperProps={{ style: { height: "100%" } }}
    >
      <DialogTitle disableTypography>
        <Typography variant="h4">Conditions générales d'utilisation</Typography>
      </DialogTitle>
      <DialogContent dividers>
        <CGUContent />
      </DialogContent>
      <CustomDialogActions>
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
      </CustomDialogActions>
    </Dialog>
  );
}

export default CGUModal;
