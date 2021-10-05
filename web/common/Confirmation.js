import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import { LoadingButton } from "common/components/LoadingButton";
import { CustomDialogActions, CustomDialogTitle } from "./CustomDialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { useApi } from "common/utils/api";
import { DISABLE_WARNING_MUTATION } from "common/utils/apiQueries";

export default function ConfirmationModal({
  title,
  textButtons,
  confirmButtonLabel,
  cancelButtonLabel,
  disableWarningName = null,
  content = null,
  open,
  handleClose,
  handleConfirm
}) {
  const api = useApi();
  const [shouldDisableWarning, setShouldDisableWarning] = React.useState(false);

  React.useEffect(() => {
    if (open) setShouldDisableWarning(false);
  }, [open]);

  async function handleConfirmWithEventualWarningDisable(...args) {
    try {
      if (disableWarningName && shouldDisableWarning) {
        await api.graphQlMutate(
          DISABLE_WARNING_MUTATION,
          { warningName: disableWarningName },
          { context: { nonPublicApi: true } }
        );
      }
    } finally {
      await handleConfirm(...args);
    }
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <CustomDialogTitle
        title={title || "Confirmer"}
        handleClose={handleClose}
      />
      {(content || disableWarningName) && (
        <DialogContent>
          {content}
          {disableWarningName && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldDisableWarning}
                  onChange={e => setShouldDisableWarning(e.target.checked)}
                  size="small"
                />
              }
              label={
                <Typography variant="caption">
                  Ne plus afficher ce message
                </Typography>
              }
            />
          )}
        </DialogContent>
      )}
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
              await handleConfirmWithEventualWarningDisable(...args);
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
