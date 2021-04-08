import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import { LoadingButton } from "common/components/LoadingButton";
import { CustomDialogActions, CustomDialogTitle } from "./CustomDialogTitle";

export function ConfirmationModal({
  title,
  textButtons,
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
      <CustomDialogActions>
        {textButtons ? (
          <LoadingButton
            aria-label="Confirmer"
            color="primary"
            onClick={handleClose}
          >
            Non
          </LoadingButton>
        ) : (
          <IconButton aria-label="Confirmer" onClick={handleClose}>
            <CloseIcon color="error" />
          </IconButton>
        )}
        {textButtons ? (
          <LoadingButton
            aria-label="Annuler"
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
