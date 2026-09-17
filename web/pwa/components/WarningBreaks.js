import React from "react";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

export const WarningBreaks = () => (
  <Notice
    severity="warning"
    title="Pensez à respecter le temps de pause obligatoire lors de votre prochaine mission afin de respecter la réglementation !"
    link={{
      linkProps: {
        href: "https://mobilic.beta.gouv.fr/resources/regulations",
        style: {
          display: "flex",
          alignItems: "center",
          width: "fit-content",
        }
      },
      text: (
        <>
          En savoir plus sur les temps de pause
          <span
            className="fr-icon-arrow-right-line fr-icon--sm"
            aria-hidden="true"
            style={{ marginLeft: "0.5rem" }}
          />
        </>
      )
    }}
  />
);
