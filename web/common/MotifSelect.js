import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { MOTIFS, MOTIF_TECHNICAL_MALFUNCTION } from "common/utils/motifs";
import { MandatorySuffix } from "./forms/MandatorySuffix";
import Notice from "./Notice";

export default function MotifSelect({ value, onChange, required = false }) {
  const isTechnicalMalfunction = value === MOTIF_TECHNICAL_MALFUNCTION;

  return (
    <>
      <Select
        label={
          <>
            Motif de l'ajout
            {required && <MandatorySuffix />}
          </>
        }
        nativeSelectProps={{
          required,
          value: value || "",
          onChange: e => onChange(e.target.value)
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
      {isTechnicalMalfunction ? (
        <Notice
          type="warning"
          description="Les agents de contrôle sont informés des dysfonctionnements techniques."
        />
      ) : (
        <Notice
          type="info"
          description={
            <>
              Le motif «&nbsp;Problème téléphone&nbsp;» peut être sélectionné en
              cas d'absence de réseau ou de batterie.
            </>
          }
        />
      )}
    </>
  );
}
