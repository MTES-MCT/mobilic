import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import { formatApiError } from "common/utils/errors";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../common/CustomDialogTitle";

export function ChangeEmailModal({ open, handleClose, handleSubmit }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

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
        noValidate
        autoComplete="off"
        onSubmit={async e => {
          e.preventDefault();
          try {
            await handleSubmit(email);
            handleClose();
          } catch (err) {
            setError(formatApiError(err));
          }
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
              setError("");
              setEmail(e.target.value.replace(/\s/g, ""));
            }}
          />
          {error && <Typography color="error">{error}</Typography>}
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
