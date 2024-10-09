import React from "react";
import Modal from "../../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function ConfirmationDSFR({
  title,
  content,
  confirmButtonLabel,
  cancelButtonLabel,
  open,
  handleClose,
  handleConfirm,
  handleCancel
}) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={title}
      content={content}
      actions={
        <>
          <Button
            title="Annuler"
            onClick={(...args) => {
              handleCancel(...args);
              handleClose();
            }}
          >
            {cancelButtonLabel}
          </Button>
          <Button
            title="Confirmer"
            onClick={(...args) => {
              handleConfirm(...args);
              handleClose();
            }}
            priority="secondary"
          >
            {confirmButtonLabel}
          </Button>
        </>
      }
    />
  );
}
