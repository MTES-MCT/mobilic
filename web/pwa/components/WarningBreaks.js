import React from "react";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

const DISMISSED_STORAGE_KEY_PREFIX = "mobilic.warningBreaks.dismissed.";

export const WarningBreaks = ({ dismissKey }) => {
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
      title="Pensez à respecter le temps de pause obligatoire lors de votre prochaine mission afin de respecter la réglementation !"
      link={{
        linkProps: {
          href: "https://mobilic.beta.gouv.fr/resources/regulations?regle=pause-et-repos-quotidiens",
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
};
