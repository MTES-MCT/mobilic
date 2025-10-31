import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Stack } from "@mui/material";
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo
} from "react";
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

const mergeNotifications = (apiNotifs, localNotifs) => {
  const localById = Object.fromEntries(localNotifs.map(n => [n.id, n]));

  const apiIds = new Set(apiNotifs.map(api => api.id));

  const allNotifs = [
    ...apiNotifs.map(api =>
      localById[api.id] ? { ...api, read: localById[api.id].read } : api
    ),
    ...localNotifs.filter(local => !apiIds.has(local.id))
  ];

  return allNotifs.sort(
    (a, b) => new Date(b.creationTime) - new Date(a.creationTime)
  );
};

const InnerNotification = React.memo(
  ({ type, data, read, openHistory, onNotificationClick }) => {
    const details = React.useMemo(() => {
      if (!data) return null;
      return getNotificationContent(type, JSON.parse(data));
    }, [type, data]);

    if (!details) {
      return null;
    }

    const { title, content, missionId } = details;
    return (
      <Notification
        title={title}
        content={content}
        missionId={missionId}
        historyOnClick={() => onNotificationClick(missionId)}
        read={read}
      />
    );
  }
);

export const Notifications = ({ openHistory }) => {
  const id = "fr-accordion-notifs";
  const collapseElementId = `${id}-collapse`;

  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();

  const [notifs, setNotifs] = useState(() => userInfo.notifications || []);

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
    setNotifs(userInfo.notifications || []);
  }, [userInfo.notifications]);

  useEffect(() => {
    if (!userInfo?.id) return;

    const loadNotifications = async () => {
      await alerts.withApiErrorHandling(async () => {
        const apiResponse = await api.graphQlQuery(
          NOTIFICATIONS_QUERY,
          { id: userInfo.id },
          {}
        );

        const apiNotifs = apiResponse.data.user.notifications;
        const localNotifs = store.userInfo().notifications || [];
        const merged = mergeNotifications(apiNotifs, localNotifs);

        setNotifs(merged);
        await store.setUserInfo({
          ...store.userInfo(),
          notifications: merged
        });
      }, "get-notifications");
    };

    loadNotifications();
  }, [api, store, userInfo?.id, alerts]);

  const updateNotificationsReadStatus = useCallback(
    async (notificationIds, errorKey = "read-notifications") => {
      const updatedNotifs = notifsRef.current.map(n =>
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      );

      setNotifs(updatedNotifs);
      await store.setUserInfo({
        ...store.userInfo(),
        notifications: updatedNotifs
      });

      await alerts.withApiErrorHandling(async () => {
        await api.graphQlMutate(
          READ_NOTIFICATIONS_MUTATION,
          { notificationIds },
          { context: { nonPublicApi: true } }
        );
      }, errorKey);
    },
    [api, store, alerts]
  );

  useEffect(() => {
    return () => {
      if (isExpendedRef.current && notifsRef.current.some(n => !n.read)) {
        const allNotificationIds = notifsRef.current.map(n => n.id);
        updateNotificationsReadStatus(allNotificationIds, "read-notifications");
      }
    };
  }, [updateNotificationsReadStatus]);

  const markNotificationAsRead = useCallback(
    async notificationId => {
      await updateNotificationsReadStatus(
        [notificationId],
        "read-notification"
      );
    },
    [updateNotificationsReadStatus]
  );

  const markNotificationsAsRead = useCallback(async () => {
    const allNotificationIds = notifsRef.current.map(n => n.id);
    await updateNotificationsReadStatus(
      allNotificationIds,
      "read-notifications"
    );
  }, [updateNotificationsReadStatus]);

  const handleNotificationClick = useCallback(
    async missionId => {
      const notification = notifsRef.current.find(n => {
        const details = getNotificationContent(n.type, JSON.parse(n.data));
        return details.missionId === missionId;
      });

      if (notification && !notification.read) {
        await markNotificationAsRead(notification.id);
      }

      openHistory(missionId);
    },
    [markNotificationAsRead, openHistory]
  );

  const onExtendButtonClick = useCallback(async () => {
    const isExpended_newValue = !isExpended;
    setIsExpended(isExpended_newValue);

    if (
      isExpended &&
      !isExpended_newValue &&
      notifsRef.current.some(n => !n.read)
    ) {
      await markNotificationsAsRead();
    }
  }, [isExpended, markNotificationsAsRead]);

  const unreadNotifs = useMemo(() => notifs.filter(n => !n.read), [notifs]);

  const title = useMemo(
    () => (unreadNotifs.length > 0 ? unreadNotifs.length : ""),
    [unreadNotifs.length]
  );

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
        <Stack direction="column" width="100%" maxHeight="83vh">
          {notifs.length > 0 ? (
            notifs.map(notif => (
              <InnerNotification
                key={`notif__${notif.id}`}
                {...notif}
                openHistory={openHistory}
                onNotificationClick={handleNotificationClick}
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
          style={{
            justifyContent: "flex-start"
          }}
        >
          <Stack direction="row" gap={1} alignItems="center" pl={1}>
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
              <Badge noIcon severity="error" style={{ fontSize: "0.650rem" }}>
                {title}
              </Badge>
            )}
          </Stack>
        </button>
      </h3>
    </section>
  );
};
