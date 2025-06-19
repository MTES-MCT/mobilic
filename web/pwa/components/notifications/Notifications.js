import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Stack } from "@mui/material";
import React, { useState, useCallback } from "react";
import { Notification } from "./Notification";

const notifs = [
  {
    title: "Votre gestionnaire a modifié la mission Déménagement du 10/12/2024",
    content: "Retrouvez le détail des modifications dans votre historique.",
    read: false,
    link: "Afficher l'historique"
  },
  {
    title: "Mission Tournée du 09/12/2024 validée automatiquement",
    content:
      "Informez votre gestionnaire de vos horaires réels en laissant une observation dans l’historique.",
    read: true
  }
];

export const Notifications = () => {
  const id = "fr-accordion-notifs";

  const collapseElementId = `${id}-collapse`;

  const [isExpanded, setIsExpanded] = useState(false);

  const onExtendButtonClick = useCallback(() => {
    const isExpended_newValue = !isExpanded;
    setIsExpanded(isExpended_newValue);
  });

  return (
    <section
      className={fr.cx("fr-accordion")}
      style={{ backgroundColor: "white" }}
    >
      <div
        className={fr.cx("fr-collapse")}
        id={collapseElementId}
        style={{ padding: 0 }}
      >
        <Stack direction="column" width="100%">
          {notifs.map((notif, notif_id) => (
            <Notification key={`notif__${notif_id}`} {...notif} />
          ))}
        </Stack>
      </div>
      <h3 className={fr.cx("fr-accordion__title")}>
        <button
          className={fr.cx("fr-accordion__btn")}
          aria-expanded={isExpanded}
          aria-controls={collapseElementId}
          onClick={onExtendButtonClick}
          type="button"
          id={`${id}__toggle-btn`}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            width="100%"
            pr={1}
          >
            <span
              className={fr.cx(
                "fr-btn--icon-left",
                "fr-icon-notification-3-line"
              )}
              style={{ fontWeight: 700, fontSize: "1rem" }}
            >
              Informations
            </span>
            <Badge noIcon severity="error" style={{ fontSize: "0.625rem" }}>
              2 nouveaux messages
            </Badge>
          </Stack>
        </button>
      </h3>
    </section>
  );
};
