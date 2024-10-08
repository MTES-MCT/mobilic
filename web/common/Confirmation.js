import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { LoadingButton } from "common/components/LoadingButton";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useApi } from "common/utils/api";
import { DISABLE_WARNING_MUTATION } from "common/utils/apiQueries";
import Modal from "./Modal";

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
    } catch {
      // Do nothing, if this call fails, modal should be closed anyway
    } finally {
      await handleConfirm(...args);
    }
  }

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={title || "Confirmer"}
      content={
        <>
          {(content || disableWarningName) && (
            <>
              {content}
              {disableWarningName && (
                <FormControlLabel
                  control={
                    <Checkbox
                      color="secondary"
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
            </>
          )}
        </>
      }
      actions={
        <>
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
        </>
      }
    />
  );
}
