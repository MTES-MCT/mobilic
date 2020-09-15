import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { LoadingButton } from "common/components/LoadingButton";

export function ConfirmationModal({
  title,
  textButtons,
  open,
  handleClose,
  handleConfirm
}) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle disableTypography>
        <Typography variant="h4">{title || "Confirmer"}</Typography>
      </DialogTitle>
      <DialogActions>
        {textButtons ? (
          <LoadingButton color="primary" onClick={handleClose}>
            Non
          </LoadingButton>
        ) : (
          <IconButton onClick={handleClose}>
            <CloseIcon color="error" />
          </IconButton>
        )}
        {textButtons ? (
          <LoadingButton
            color="primary"
            onClick={async (...args) => {
              await handleConfirm(...args);
              handleClose();
            }}
          >
            Oui
          </LoadingButton>
        ) : (
          <IconButton
            onClick={(...args) => {
              handleConfirm(...args);
              handleClose();
            }}
          >
            <CheckIcon color="primary" />
          </IconButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
