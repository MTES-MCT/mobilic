import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { EmailField } from "../../common/EmailField";

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
            value={email}
            validate
            setValue={setEmail}
            error={error}
            setError={setError}
            hintText="Format attendu : prenom.nom@domaine.fr"
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
