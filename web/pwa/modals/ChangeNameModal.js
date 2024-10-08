import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import Modal from "../../common/Modal";
import { Input } from "../../common/forms/Input";

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
    <Modal
      open={open}
      handleClose={handleClose}
      size="sm"
      title="Changer votre nom / prénom"
      content={
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
          id="update-name-form"
        >
          <Input
            label="Prénom"
            nativeInputProps={{
              value: newFirstName,
              onChange: e => {
                setNewFirstName(e.target.value.trimLeft());
              }
            }}
            required
          />
          <Input
            label="Nom"
            nativeInputProps={{
              value: newLastName,
              onChange: e => {
                setNewLastName(e.target.value.trimLeft());
              }
            }}
            required
          />
        </form>
      }
      actions={
        <LoadingButton
          type="submit"
          disabled={!newFirstName || !newLastName}
          color="primary"
          form="update-name-form"
        >
          Enregistrer
        </LoadingButton>
      }
    />
  );
}
