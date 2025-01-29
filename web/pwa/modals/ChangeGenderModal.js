import React from "react";
import { LoadingButton } from "common/components/LoadingButton";

import { useSnackbarAlerts } from "../../common/Snackbar";

import Modal from "../../common/Modal";
import GenderSelect from "../../common/GenderSelect";
import { useUpdateGender } from "../../home/useUpdateGender";

export default function ChangeGenderModal({
  open,
  handleClose,
  currentGender,
  title = "Modifier votre sexe",
  buttonLabel = "Enregistrer",
  showExplanation = false
}) {
  const [selectedGender, setSelectedGender] = React.useState(
    currentGender || undefined
  );
  const canSubmit = React.useMemo(() => !!selectedGender, [selectedGender]);

  const { updateGender } = useUpdateGender();
  const alerts = useSnackbarAlerts();

  return (
    <Modal
      size="sm"
      title={title}
      open={open}
      handleClose={handleClose}
      content={
        <form
          id="udpate-gender-form"
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            await alerts.withApiErrorHandling(async () => {
              await updateGender(selectedGender);
              if (handleClose) {
                handleClose();
              }
            }, "change-gender");
          }}
        >
          {showExplanation && (
            <p>
              Ce renseignement est nécessaire dans le cadre d’une étude menée
              par le ministère chargé des Transports visant à quantifier la part
              d’hommes et de femmes dans le transport routier léger.
            </p>
          )}
          <GenderSelect
            currentGender={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </form>
      }
      actions={
        <>
          <LoadingButton
            type="submit"
            form="udpate-gender-form"
            disabled={!canSubmit}
          >
            {buttonLabel}
          </LoadingButton>
        </>
      }
    />
  );
}
