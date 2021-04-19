import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Typography from "@material-ui/core/Typography";

export default function UnavailableOfflineModeModal({ open, handleClose }) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <Alert
        onClose={handleClose}
        elevation={5}
        variant="filled"
        severity="error"
        style={{ textAlign: "justify" }}
      >
        <AlertTitle className="bold">
          Navigation hors connexion impossible
        </AlertTitle>
        <Typography>
          L'action a échoué car vous ne semblez pas connecté à Internet et le
          mode hors connexion n'est pas compatible avec votre navigateur. Nous
          recommandons d'utiliser une version récente de Chrome, Firefox ou
          Safari.
        </Typography>
      </Alert>
    </Dialog>
  );
}
