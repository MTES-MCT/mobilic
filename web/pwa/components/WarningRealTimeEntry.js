import React from "react";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

const DISMISSED_STORAGE_KEY_PREFIX = "mobilic.warningRealTimeEntry.dismissed.";

export const WarningRealTimeEntry = ({ dismissKey }) => {
  const storageKey = `${DISMISSED_STORAGE_KEY_PREFIX}${dismissKey}`;
  const [isDismissed, setIsDismissed] = React.useState(
    () => sessionStorage.getItem(storageKey) === "true"
  );

  React.useEffect(() => {
    setIsDismissed(sessionStorage.getItem(storageKey) === "true");
  }, [storageKey]);

  if (isDismissed) return null;

  return (
    <Notice
      severity="warning"
      isClosable
      onClose={() => {
        sessionStorage.setItem(storageKey, "true");
        setIsDismissed(true);
      }}
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
};
