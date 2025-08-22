import React from "react";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";

export default function SignFilesCheckbox({ sign, setSign }) {
  return (
    <ToggleSwitch
      label="Ajouter des signatures numériques aux fichiers pour prouver leur
    intégrité"
      checked={sign}
      onChange={checked => setSign(checked)}
    />
  );
}
