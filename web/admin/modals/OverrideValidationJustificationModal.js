import React from "react";
import Modal from "../../common/Modal";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const JUSTIFICATIONS = [
  {
    value: "professional",
    key: "PROFESSIONAL",
    label: "Raisons professionnelles"
  },
  {
    value: "time_off",
    key: "TIME_OFF",
    label: "Congé"
  },
  {
    value: "personal",
    key: "PERSONAL",
    label: "Raisons personnelles"
  }
];
export default function OverrideValidationJustificationModal({
  open,
  handleClose,
  updateJustification
}) {
  const [justification, setJustification] = React.useState(
    JUSTIFICATIONS[0].value
  );

  const _handleSubmit = React.useCallback(() => {
    updateJustification(justification);
    if (handleClose) {
      handleClose();
    }
  }, [justification]);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Veuillez justifier cette modification"
      size="sm"
      content={
        <>
          <p>
            La mission ayant été validée automatiquement, un motif est
            obligatoire pour valider la mission.
          </p>
          <Select
            label="Motif"
            nativeSelectProps={{
              onChange: e => setJustification(e.target.value),
              value: justification.value
            }}
          >
            {JUSTIFICATIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </>
      }
      actions={
        <>
          <Button onClick={handleClose} priority="secondary">
            Annuler
          </Button>
          <Button onClick={() => _handleSubmit()}>Enregistrer</Button>
        </>
      }
    />
  );
}
