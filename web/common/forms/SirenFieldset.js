import React from "react";

export const SirenFieldset = ({
  labelAnnuaire = "Annuaire des entreprises",
  children
}) => (
  <fieldset className="fr-fieldset" aria-label="Identifiant entreprise">
    <div className="fr-fieldset__element">{children}</div>
    <div className="fr-mt-n1v fr-fieldset__element">
      <a
        className="fr-link"
        target="_blank"
        rel="noopener noreferrer"
        href="https://annuaire-entreprises.data.gouv.fr/"
      >
        {labelAnnuaire}
      </a>
    </div>
  </fieldset>
);
