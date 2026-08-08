import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Modal from "../../common/Modal";

export default function AbandonMissionModal({ open, handleClose, handleSubmit }) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Abandon de la mission"
      size="sm"
      content={<p>Vos saisies de temps seront perdues.</p>}
      actions={
        <>
          <Button priority="secondary" onClick={handleClose}>
            Revenir à la mission
          </Button>
          <Button onClick={handleSubmit}>Quitter sans enregistrer</Button>
        </>
      }
    />
  );
}
