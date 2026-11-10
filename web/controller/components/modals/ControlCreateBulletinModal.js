import React from "react";
import Modal from "../../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function ControlCreateBulletinModal({
  open,
  handleClose,
  handleCreate,
  handleCloseControl,
  askCompanyEmail = false,
}) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Éditer le bulletin de contrôle"
      size="sm"
      content={
        <p>
          <strong>
            Vous pourrez l’envoyer à l’entreprise de manière dématérialisée.
          </strong>
          La création comme l’envoi peuvent aussi être réalisés a posteriori.
          {askCompanyEmail &&
            " Pensez à demander l’adresse e-mail de l’entreprise."}
        </p>
      }
      actions={
        <>
          <Button priority="secondary" onClick={handleCloseControl}>
            Fermer le contrôle
          </Button>
          <Button priority="primary" onClick={handleCreate}>
            Créer le bulletin
          </Button>
        </>
      }
    />
  );
}
