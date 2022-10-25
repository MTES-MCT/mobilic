import React from "react";
import { Modal, ModalTitle, ModalContent } from "@dataesr/react-dsfr";
import { HelpController } from "../help/ModalHelpController";

export default function ControllerHelp({ open, handleClose }) {
  return (
    <Modal isOpen={open} hide={handleClose} size="lg">
      <ModalTitle>Besoin d'aide ?</ModalTitle>
      <ModalContent>
        <HelpController />
      </ModalContent>
    </Modal>
  );
}
