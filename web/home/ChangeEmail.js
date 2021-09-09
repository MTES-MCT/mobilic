import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../common/CustomDialogTitle";
import { useSnackbarAlerts } from "../common/Snackbar";
import { EmailField } from "../common/EmailField";

export default function ChangeEmailModal({ open, handleClose, handleSubmit }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  const alerts = useSnackbarAlerts();

  React.useEffect(() => {
    setEmail("");
    setError("");
  }, [open]);

  return (
    <Dialog maxWidth="sm" onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle
        handleClose={handleClose}
        title="Nouvelle adresse email"
      />
      <form
        autoComplete="off"
        onSubmit={async e => {
          e.preventDefault();
          await alerts.withApiErrorHandling(async () => {
            await handleSubmit(email);
            handleClose();
          }, "change-email");
        }}
      >
        <DialogContent>
          <EmailField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Email"
            value={email}
            validate
            setValue={setEmail}
            error={error}
            setError={setError}
          />
        </DialogContent>
        <CustomDialogActions>
          <LoadingButton
            type="submit"
            disabled={error || !email}
            color="primary"
          >
            Enregistrer
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
