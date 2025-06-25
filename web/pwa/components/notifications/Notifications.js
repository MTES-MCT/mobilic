import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Stack } from "@mui/material";
import React, { useState, useCallback } from "react";
import { Notification } from "./Notification";
import { cx } from "@codegouvfr/react-dsfr/fr/cx";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { READ_NOTIFICATIONS_MUTATION } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";

const getNotificationDetails = (type, data) => {
  switch (type) {
    case "MISSION_CHANGES_WARNING": {
      const missionStartDate = data.mission_start_date;
      const missionId = 597; //data.mission_id;
      return {
        title: `Votre gestionnaire a modifié votre mission du ${missionStartDate}`,
        content: "Retrouvez le détail des modifications dans votre historique.",
        missionId: missionId
      };
    }
    default:
      return {};
  }
};
const InnerNotification = ({ type, data, read, openHistory }) => {
  if (!data) {
    return null;
  }
  const details = getNotificationDetails(type, JSON.parse(data));
  const { title, content, missionId } = details;
  return (
    <Notification
      title={title}
      content={content}
      missionId={missionId}
      historyOnClick={() => openHistory(missionId)}
      read={read}
    />
  );
};

export const Notifications = ({ openHistory }) => {
  const id = "fr-accordion-notifs";
  const collapseElementId = `${id}-collapse`;

  // Récupère les notifications depuis le store
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();

  const [notifs] = React.useState(userInfo.notifications);

  const [isExpanded, setIsExpanded] = useState(false);
  const api = useApi();
  const onExtendButtonClick = useCallback(async () => {
    const isExpended_newValue = !isExpanded;
    setIsExpanded(isExpended_newValue);

    if (isExpended_newValue) {
      const apiResponse = await api.graphQlMutate(
        READ_NOTIFICATIONS_MUTATION,
        { notificationIds: notifs.map(n => n.id) },
        { context: { nonPublicApi: true } }
      );
      await store.setUserInfo({
        ...store.userInfo(),
        notifications: apiResponse.data.account.markNotificationsAsRead
      });
    }
  });

  const unreadNotifs = notifs.filter(n => !n.read);
  const title =
    unreadNotifs.length > 0 ? `${unreadNotifs.length} nouveaux messages` : "";

  return (
    <section
      className={cx(fr.cx("fr-accordion"), "notifications")}
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
          {notifs?.map((notif, notif_id) => (
            <InnerNotification
              key={`notif__${notif_id}`}
              {...notif}
              openHistory={openHistory}
            />
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
            {title && (
              <Badge noIcon severity="error" style={{ fontSize: "0.625rem" }}>
                {title}
              </Badge>
            )}
          </Stack>
        </button>
      </h3>
    </section>
  );
};
