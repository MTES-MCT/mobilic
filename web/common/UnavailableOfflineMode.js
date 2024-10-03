import React from "react";
import Dialog from "@mui/material/Dialog";
import Notice from "./Notice";

export default function UnavailableOfflineModeModal({ open, handleClose }) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <Notice
        type="error"
        style={{ textAlign: "justify" }}
        title="Navigation hors connexion impossible"
        description="L'action a échoué car vous ne semblez pas connecté à Internet et le
          mode hors connexion n'est pas compatible avec votre navigateur. Nous
          recommandons d'utiliser une version récente de Chrome, Firefox ou
          Safari."
        onClose={handleClose}
      />
    </Dialog>
  );
}
