import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { LoadingButton } from "common/components/LoadingButton";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../common/CustomDialogTitle";
import { useSnackbarAlerts } from "../common/Snackbar";

export default function ChangeEmailModal({ open, handleClose, handleSubmit }) {
  const [email, setEmail] = React.useState("");

  const alerts = useSnackbarAlerts();

  React.useEffect(() => {
    setEmail("");
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
          <TextField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={e => {
              setEmail(e.target.value.replace(/\s/g, ""));
            }}
          />
        </DialogContent>
        <CustomDialogActions>
          <LoadingButton type="submit" disabled={!email} color="primary">
            Enregistrer
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
