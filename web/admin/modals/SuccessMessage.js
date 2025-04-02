import React from "react";
import Modal from "../../common/Modal";

export default function SuccessMessageModal({
  open,
  handleClose,
  title,
  description
}) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={title}
      content={description}
    />
  );
}
