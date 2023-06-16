import React from "react";
import {
  Button,
  ButtonGroup,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle
} from "@dataesr/react-dsfr";

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
    <Modal isOpen={open} hide={handleClose}>
      <ModalTitle>{title}</ModalTitle>
      <ModalContent>{content}</ModalContent>
      <ModalFooter>
        <ButtonGroup isInlineFrom="md" align="right">
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
            secondary
            title="Confirmer"
            onClick={(...args) => {
              handleConfirm(...args);
              handleClose();
            }}
          >
            {confirmButtonLabel}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}
