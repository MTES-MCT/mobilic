import React from "react";
import { LoadingButton } from "common/components/LoadingButton";

import { useSnackbarAlerts } from "../../common/Snackbar";

import Modal from "../../common/Modal";
import GenderSelect from "../../common/GenderSelect";

export default function ChangeGenderModal({
  open,
  handleClose,
  handleSubmit,
  currentGender
}) {
  const [selectedGender, setSelectedGender] = React.useState(currentGender);
  const alerts = useSnackbarAlerts();

  return (
    <Modal
      size="sm"
      title="Modifier votre sexe"
      open={open}
      handleClose={handleClose}
      content={
        <form
          id="udpate-gender-form"
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            await alerts.withApiErrorHandling(async () => {
              await handleSubmit(selectedGender);
              handleClose();
            }, "change-gender");
          }}
        >
          <GenderSelect
            currentGender={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </form>
      }
      actions={
        <>
          <LoadingButton type="submit" form="udpate-gender-form">
            Enregistrer
          </LoadingButton>
        </>
      }
    />
  );
}
