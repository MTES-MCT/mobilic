import React from "react";
import Notice from "./Notice";
import Modal from "./Modal";

export default function UnavailableOfflineModeModal({ open, handleClose }) {
  return (
    <Modal
      size="sm"
      open={open}
      handleClose={handleClose}
      content={
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
      }
    />
  );
}
