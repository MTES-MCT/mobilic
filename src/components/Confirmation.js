import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";

export function ConfirmationModal({ title, open, handleClose, handleConfirm }) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{title || "Confirmer"}</DialogTitle>
      <DialogActions>
        <IconButton onClick={handleClose}>
          <CloseIcon color="error" />
        </IconButton>
        <IconButton
          onClick={(...args) => {
            handleConfirm(...args);
            handleClose();
          }}
        >
          <CheckIcon color="primary" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
