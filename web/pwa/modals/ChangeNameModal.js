import React from "react";
import Dialog from "@mui/material/Dialog";
import { LoadingButton } from "common/components/LoadingButton";
import TextField from "@mui/material/TextField";
import DialogContent from "@mui/material/DialogContent";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";

export default function ChangeNameModal({
  open,
  handleClose,
  handleSubmit,
  firstName,
  lastName
}) {
  const [newFirstName, setNewFirstName] = React.useState(firstName);
  const [newLastName, setNewLastName] = React.useState(lastName);

  const alerts = useSnackbarAlerts();

  return (
    <Dialog maxWidth="sm" onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle
        handleClose={handleClose}
        title="Changer votre nom / prénom"
      />
      <form
        autoComplete="off"
        onSubmit={async e => {
          e.preventDefault();
          await alerts.withApiErrorHandling(async () => {
            await handleSubmit({
              firstName: newFirstName,
              lastName: newLastName
            });
            handleClose();
          }, "change-name");
        }}
      >
        <DialogContent>
          <TextField
            required
            fullWidth
            variant="standard"
            className="vertical-form-text-input"
            label="Prénom"
            value={newFirstName}
            onChange={e => {
              setNewFirstName(e.target.value.trimLeft());
            }}
          />
          <TextField
            required
            fullWidth
            variant="standard"
            className="vertical-form-text-input"
            label="Nom"
            value={newLastName}
            onChange={e => {
              setNewLastName(e.target.value.trimLeft());
            }}
          />
        </DialogContent>
        <CustomDialogActions>
          <LoadingButton
            type="submit"
            disabled={!newFirstName || !newLastName}
            color="primary"
          >
            Enregistrer
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
