import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useModals } from "common/utils/modals";
import { MOTIFS, MOTIF_TECHNICAL_MALFUNCTION } from "common/utils/motifs";
import Notice from "./Notice";

export default function MotifSelect({ value, onChange, required = false }) {
  const modals = useModals();

  const handleChange = e => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue === MOTIF_TECHNICAL_MALFUNCTION) {
      const previousValue = value;
      let confirmed = false;
      modals.open("confirmation", {
        title: "Confirmation du motif",
        confirmButtonLabel: "J'ai compris",
        cancelButtonLabel: "Annuler",
        content: (
          <p>
            Les agents de contrôle sont informés des dysfonctionnements
            techniques.
          </p>
        ),
        handleConfirm: () => {
          confirmed = true;
        },
        handleClose: () => {
          if (!confirmed) onChange(previousValue);
          return modals.close("confirmation");
        }
      });
    }
  };

  return (
    <>
      <Select
        label="Motif"
        nativeSelectProps={{
          required,
          value: value || "",
          onChange: handleChange
        }}
      >
        <option value="" disabled hidden>
          Sélectionner un motif
        </option>
        {MOTIFS.map(({ value: motifValue, label }) => (
          <option key={motifValue} value={motifValue}>
            {label}
          </option>
        ))}
      </Select>
      {value === MOTIF_TECHNICAL_MALFUNCTION && (
        <Notice
          type="alert"
          description="Les agents de contrôle sont informés des dysfonctionnements techniques."
        />
      )}
      <Notice
        type="info"
        description={
          <>
            Le motif «&nbsp;Problème téléphone&nbsp;» peut être sélectionné en
            cas d'absence de réseau ou de batterie.
          </>
        }
      />
    </>
  );
}
