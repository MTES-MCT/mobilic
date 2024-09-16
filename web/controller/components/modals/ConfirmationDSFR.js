import React from "react";
import Modal from "../../../common/Modal";
import { Button } from "@dataesr/react-dsfr";

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
            secondary
            title="Confirmer"
            onClick={(...args) => {
              handleConfirm(...args);
              handleClose();
            }}
          >
            {confirmButtonLabel}
          </Button>
          <Button
            title="Annuler"
            onClick={(...args) => {
              handleCancel(...args);
              handleClose();
            }}
          >
            {cancelButtonLabel}
          </Button>
        </>
      }
    />
  );
}
