import React from "react";
import Modal from "../../../common/Modal";

export default function ControlPicture({ open, handleClose, src, title }) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={title}
      content={
        <img
          alt={title}
          src={src}
          style={{ display: "block", margin: "auto", maxWidth: "100%" }}
        />
      }
      size="lg"
    />
  );
}
