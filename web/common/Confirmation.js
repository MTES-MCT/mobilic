import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import { LoadingButton } from "common/components/LoadingButton";
import { CustomDialogActions, CustomDialogTitle } from "./CustomDialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

export default function ConfirmationModal({
  title,
  textButtons,
  confirmButtonLabel,
  cancelButtonLabel,
  content = null,
  open,
  handleClose,
  handleConfirm
}) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <CustomDialogTitle
        title={title || "Confirmer"}
        handleClose={handleClose}
      />
      {content && <DialogContent>{content}</DialogContent>}
      <CustomDialogActions>
        {cancelButtonLabel || textButtons ? (
          <LoadingButton
            aria-label="Confirmer"
            color="primary"
            onClick={handleClose}
          >
            {cancelButtonLabel || "Non"}
          </LoadingButton>
        ) : (
          <IconButton aria-label="Confirmer" onClick={handleClose}>
            <CloseIcon color="error" />
          </IconButton>
        )}
        {confirmButtonLabel || textButtons ? (
          <LoadingButton
            aria-label="Annuler"
            color="primary"
            variant="contained"
            onClick={async (...args) => {
              await handleConfirm(...args);
              handleClose();
            }}
          >
            {confirmButtonLabel || "Oui"}
          </LoadingButton>
        ) : (
          <IconButton
            aria-label="Annuler"
            onClick={(...args) => {
              handleConfirm(...args);
              handleClose();
            }}
          >
            <CheckIcon color="primary" />
          </IconButton>
        )}
      </CustomDialogActions>
    </Dialog>
  );
}
