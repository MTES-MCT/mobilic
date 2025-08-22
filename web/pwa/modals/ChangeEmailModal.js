import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";

import { EmailField } from "../../common/EmailField";
import Modal from "../../common/Modal";

export default function ChangeEmailModal({ open, handleClose, handleSubmit }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  const alerts = useSnackbarAlerts();

  React.useEffect(() => {
    setEmail("");
    setError("");
  }, [open]);

  return (
    <Modal
      size="sm"
      title="Nouvelle adresse email"
      open={open}
      handleClose={handleClose}
      content={
        <form
          id="update-email-form"
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            await alerts.withApiErrorHandling(async () => {
              await handleSubmit(email);
              handleClose();
            }, "change-email");
          }}
        >
          <EmailField
            required
            value={email}
            validate
            setValue={setEmail}
            error={error}
            setError={setError}
            showHint
          />
        </form>
      }
      actions={
        <>
          <LoadingButton
            type="submit"
            disabled={error || !email}
            form="update-email-form"
          >
            Enregistrer
          </LoadingButton>
        </>
      }
    />
  );
}
