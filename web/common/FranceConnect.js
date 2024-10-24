import React from "react";
import { FranceConnectButton } from "@codegouvfr/react-dsfr/FranceConnectButton";

export function FranceConnectContainer({ onButtonClick, ...props }) {
  return (
    <div {...props}>
      <p className="fr-text--sm fr">
        FranceConnect est la solution proposée par l’État pour sécuriser et
        simplifier la connexion aux services en ligne.
      </p>
      <FranceConnectButton onClick={onButtonClick} />
    </div>
  );
}
