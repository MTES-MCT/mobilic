import React from "react";
import Modal from "../../common/Modal";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Button } from "@codegouvfr/react-dsfr/Button";

export const MOTIFS = [
  {
    value: "professional",
    key: "PROFESSIONAL",
    label: "Raisons professionelles"
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
  updateMotif
}) {
  const [motif, setMotif] = React.useState(MOTIFS[0].value);

  const _handleSubmit = React.useCallback(() => {
    updateMotif(motif);
    if (handleClose) {
      handleClose();
    }
  }, [motif]);

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
              onChange: e => setMotif(e.target.value),
              value: motif.value
            }}
          >
            {MOTIFS.map(motif => (
              <option key={motif.value} value={motif.value}>
                {motif.label}
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
