import React from "react";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

export const WarningRealTimeEntry = () => (
  <Notice
    severity="warning"
    isClosable
    title="Saisissez vos activités en temps réel pour vous assurer que vos heures sont bien rémunérées."
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
          Mieux connaître mes droits
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
