import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Stack } from "@mui/material";
import React, { useState, useCallback } from "react";
import { Notification } from "./Notification";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { READ_NOTIFICATIONS_MUTATION } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";

export const Notifications = () => {
  const id = "fr-accordion-notifs";
  const collapseElementId = `${id}-collapse`;

  // Récupère les notifications depuis le store
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const notifs = userInfo.notifications || [];
  console.log("Notifications:", notifs);
  console.log("Notifications:", userInfo);
  const [isExpanded, setIsExpanded] = useState(false);
  const api = useApi();
  const onExtendButtonClick = useCallback(async () => {
    const isExpended_newValue = !isExpanded;
    setIsExpanded(isExpended_newValue);

    if (isExpanded) {
      const apiResponse = await api.graphQlMutate(
        READ_NOTIFICATIONS_MUTATION,
        { notificationIds: notifs.map(n => n.id) },
        { context: { nonPublicApi: true } }
      );

      await store.setUserInfo({
        ...store.userInfo(),
        notifications: apiResponse.data.account.MarkNotificationsAsRead
      });
    }
  });

  return (
    <section
      className={fr.cx("fr-accordion")}
      style={{
        backgroundColor: "white",
        position: "absolute",
        bottom: 0,
        width: "100%",
        zIndex: 4000
      }}
    >
      <div
        className={fr.cx("fr-collapse")}
        id={collapseElementId}
        style={{ padding: 0 }}
      >
        <Stack direction="column" width="100%" maxHeight="85vh">
          {notifs.length === 0 ? (
            <span>Aucune notification</span>
          ) : (
            notifs.map((notif, notif_id) => (
              <Notification key={`notif__${notif_id}`} {...notif} />
            ))
          )}
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
              {notifs.filter(n => !n.read).length} nouveaux messages
            </Badge>
          </Stack>
        </button>
      </h3>
    </section>
  );
};
