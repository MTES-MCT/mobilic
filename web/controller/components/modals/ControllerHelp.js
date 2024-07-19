import React from "react";
import { HelpController } from "../help/ModalHelpController";
import Modal from "../../../common/Modal";

export default function ControllerHelp({ open, handleClose }) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Besoin d'aide ?"
      content={<HelpController />}
      size="sm"
    />
  );
}
