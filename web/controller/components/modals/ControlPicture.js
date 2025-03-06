import React from "react";
import Modal from "../../../common/Modal";

export default function ControlPicture({ open, handleClose, src }) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title=""
      content={<img alt="" src={src} />}
      size="lg"
    />
  );
}
