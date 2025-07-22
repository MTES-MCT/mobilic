import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Stack } from "@mui/material";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Notification } from "./Notification";
import { cx } from "@codegouvfr/react-dsfr/fr/cx";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import {
  NOTIFICATIONS_QUERY,
  READ_NOTIFICATIONS_MUTATION
} from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { getNotificationContent } from "./NotificationContent";
import { useSnackbarAlerts } from "../../../common/Snackbar";

const InnerNotification = ({ type, data, read, openHistory }) => {
  if (!data) {
    return null;
  }
  const details = getNotificationContent(type, JSON.parse(data));
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

  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();

  const [notifs, setNotifs] = useState(userInfo.notifications || []);

  const [isExpended, setIsExpended] = useState(false);
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const isExpendedRef = useRef(isExpended);
  const notifsRef = useRef(notifs);

  useEffect(() => {
    isExpendedRef.current = isExpended;
  }, [isExpended]);

  useEffect(() => {
    notifsRef.current = notifs;
  }, [notifs]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await alerts.withApiErrorHandling(async () => {
        const apiResponse = await api.graphQlQuery(
          NOTIFICATIONS_QUERY,
          { id: userInfo?.id },
          {}
        );
        setNotifs(apiResponse.data.user.notifications);
        await store.setUserInfo({
          ...store.userInfo(),
          notifications: apiResponse.data.user.notifications
        });
      }, "get-notifications");
    }, 15000);
    return () => clearInterval(interval);
  }, [api, store, userInfo?.id]);

  useEffect(() => {
    return () => {
      if (isExpendedRef.current && notifsRef.current.some(n => !n.read)) {
        markNotificationsAsRead();
      }
    };
  }, []);

  const markNotificationsAsRead = async () => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        READ_NOTIFICATIONS_MUTATION,
        { notificationIds: notifs.map(n => n.id) },
        { context: { nonPublicApi: true } }
      );
      const updatedNotifs = apiResponse.data.account.markNotificationsAsRead;

      setNotifs(updatedNotifs);

      await store.setUserInfo({
        ...store.userInfo(),
        notifications: updatedNotifs
      });
      return updatedNotifs;
    }, "read-notifications");
  };

  const onExtendButtonClick = useCallback(async () => {
    const isExpended_newValue = !isExpended;
    setIsExpended(isExpended_newValue);

    if (!isExpended_newValue && notifs.some(n => !n.read)) {
      await markNotificationsAsRead();
    }
  }, [isExpended, notifs, markNotificationsAsRead]);

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
        zIndex: 600
      }}
    >
      <div
        className={fr.cx("fr-collapse")}
        id={collapseElementId}
        style={{ paddingTop: 0, paddingBottom: 0 }}
      >
        <Stack direction="column" width="100%" maxHeight="85vh">
          {notifs && notifs.length > 0 ? (
            notifs.map(notif => (
              <InnerNotification
                key={`notif__${notif.id}`}
                {...notif}
                openHistory={openHistory}
              />
            ))
          ) : (
            <p
              style={{
                margin: 0,
                padding: "1rem 1rem",
                color: fr.colors.decisions.background.flat.grey.default,
                borderBottom: `2px solid ${fr.colors.decisions.border.default.grey.default}`
              }}
            >
              Vous n'avez aucun message
            </p>
          )}
        </Stack>
      </div>
      <h3 className={fr.cx("fr-accordion__title")}>
        <button
          className={fr.cx("fr-accordion__btn")}
          aria-expanded={isExpended}
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
