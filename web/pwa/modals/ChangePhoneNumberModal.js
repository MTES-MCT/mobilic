import React from "react";
import Dialog from "@mui/material/Dialog";
import { LoadingButton } from "common/components/LoadingButton";

import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { PhoneNumber } from "../../common/PhoneNumber";

export default function ChangePhoneNumberModal({
  open,
  handleClose,
  handleSubmit,
  phoneNumber
}) {
  const [newPhoneNumber, setNewPhoneNumber] = React.useState(phoneNumber);

  const alerts = useSnackbarAlerts();
  const title = React.useMemo(
    () =>
      `${phoneNumber ? "Modifier votre " : "Ajouter un "}numéro de téléphone`,
    [phoneNumber]
  );

  const enableSave = React.useMemo(() => !!newPhoneNumber, [newPhoneNumber]);

  const submitNewPhoneNumber = async (e, newPhoneNumber) => {
    e.preventDefault();
    await alerts.withApiErrorHandling(async () => {
      await handleSubmit({
        newPhoneNumber
      });
      handleClose();
    }, "change-phone-number");
  };

  return (
    <Dialog maxWidth="sm" onClose={handleClose} open={open} fullWidth>
      <CustomDialogTitle handleClose={handleClose} title={title} />
      <form onSubmit={e => submitNewPhoneNumber(e, newPhoneNumber)}>
        <DialogContent>
          <PhoneNumber
            currentPhoneNumber={newPhoneNumber}
            setCurrentPhoneNumber={setNewPhoneNumber}
          />
        </DialogContent>
        <CustomDialogActions>
          {phoneNumber ? (
            <Button
              title="Supprimer le numéro"
              onClick={e => submitNewPhoneNumber(e, "")}
              variant="outlined"
              color="error"
            >
              Supprimer
            </Button>
          ) : (
            <Button title="Annuler" onClick={handleClose} variant="outlined">
              Annuler
            </Button>
          )}

          <LoadingButton
            marginLeft={1}
            type="submit"
            disabled={!enableSave}
            color="primary"
            variant="contained"
          >
            Enregistrer
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
