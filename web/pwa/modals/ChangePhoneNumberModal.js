import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { PhoneNumber } from "../../common/PhoneNumber";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";

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
    <Modal
      size="sm"
      open={open}
      handleClose={handleClose}
      title={title}
      content={
        <form
          onSubmit={e => submitNewPhoneNumber(e, newPhoneNumber)}
          id="update-phone-number-form"
        >
          <PhoneNumber
            currentPhoneNumber={newPhoneNumber}
            setCurrentPhoneNumber={setNewPhoneNumber}
          />
        </form>
      }
      actions={
        <>
          {phoneNumber ? (
            <Button
              title="Supprimer le numéro"
              onClick={e => submitNewPhoneNumber(e, "")}
              priority="secondary"
              className="error"
              form="update-phone-number-form"
            >
              Supprimer
            </Button>
          ) : (
            <Button onClick={handleClose} priority="secondary">
              Annuler
            </Button>
          )}

          <LoadingButton
            marginLeft={1}
            type="submit"
            disabled={!enableSave}
            form="update-phone-number-form"
          >
            Enregistrer
          </LoadingButton>
        </>
      }
    />
  );
}
