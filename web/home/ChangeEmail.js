import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { LoadingButton } from "common/components/LoadingButton";
import { formatApiError } from "common/utils/errors";

export function ChangeEmailModal({ open, handleClose, handleSubmit }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setEmail("");
  }, [open]);

  return (
    <Dialog maxWidth="sm" onClose={handleClose} open={open} fullWidth>
      <DialogTitle disableTypography>
        <Typography variant="h3">Nouvelle adresse email</Typography>
      </DialogTitle>
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
        <DialogActions>
          <Button color="primary" onClick={handleClose}>
            Annuler
          </Button>
          <LoadingButton type="submit" disabled={!email} color="primary">
            Enregistrer
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
