import React from "react";
import { useApi, API_HOST } from "common/utils/api";
import {
  isPushSupported,
  getPushPermissionStatus,
  subscribeToPush,
  getExistingSubscription
} from "common/utils/pushNotifications";
import { SAVE_PUSH_SUBSCRIPTION_MUTATION } from "common/utils/apiQueries/pushSubscription";
import { DISABLE_WARNING_MUTATION } from "common/utils/apiQueries/misc";
import { captureSentryException } from "common/utils/sentry";
import { useStoreSyncedWithLocalStorage } from "common/store/store";

const PUSH_DISMISSED_WARNING = "push-opt-in-dismissed";

function sendSubscriptionToBackend(api, sub) {
  const keys = sub?.toJSON?.()?.keys;
  if (!keys?.p256dh || !keys?.auth || !sub?.endpoint) return;
  return api.graphQlMutate(
    SAVE_PUSH_SUBSCRIPTION_MUTATION,
    { endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth },
    { context: { nonPublicApi: true } }
  );
}

export function usePushNotifications() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();

  const supported = isPushSupported();
  const [permission, setPermission] = React.useState(
    getPushPermissionStatus()
  );
  const [vapidKey, setVapidKey] = React.useState(null);
  const [bannerText, setBannerText] = React.useState(null);

  const dismissed = userInfo?.disabledWarnings?.includes(
    PUSH_DISMISSED_WARNING
  );

  React.useEffect(() => {
    if (!supported) return;
    fetch(`${API_HOST}/vapid-public-key`)
      .then(res => res.json())
      .then(data => {
        if (data?.publicKey) setVapidKey(data.publicKey);
        if (data?.bannerText) setBannerText(data.bannerText);
      })
      .catch(captureSentryException);
  }, [supported]);

  React.useEffect(() => {
    if (!supported || !vapidKey || permission !== "granted") return;
    getExistingSubscription()
      .then(sub => sub || subscribeToPush(vapidKey))
      .then(sub => sendSubscriptionToBackend(api, sub))
      .catch(captureSentryException);
  }, [supported, vapidKey, permission, api]);

  const requestPermission = React.useCallback(async () => {
    if (!vapidKey) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (err) {
      captureSentryException(err);
    }
  }, [vapidKey]);

  const dismiss = React.useCallback(() => {
    api
      .graphQlMutate(
        DISABLE_WARNING_MUTATION,
        { warningName: PUSH_DISMISSED_WARNING },
        { context: { nonPublicApi: true } }
      )
      .catch(captureSentryException);
    const current = store.userInfo();
    const currentWarnings = current?.disabledWarnings || [];
    if (!currentWarnings.includes(PUSH_DISMISSED_WARNING)) {
      store.setUserInfo({
        ...current,
        disabledWarnings: [...currentWarnings, PUSH_DISMISSED_WARNING]
      });
    }
  }, [api, store]);

  const shouldShowOptIn =
    supported &&
    permission === "default" &&
    !dismissed &&
    !!vapidKey;

  return {
    isSupported: supported,
    permission,
    shouldShowOptIn,
    bannerText,
    requestPermission,
    dismiss
  };
}
