import React from "react";
import { useApi } from "common/utils/api";
import {
  isPushSupported,
  getPushPermissionStatus,
  subscribeToPush,
  getExistingSubscription
} from "common/utils/pushNotifications";
import { SAVE_PUSH_SUBSCRIPTION_MUTATION } from "common/utils/apiQueries/pushSubscription";
import { API_HOST } from "common/utils/api";
import { captureSentryException } from "common/utils/sentry";

const PUSH_OPT_IN_DISMISSED_KEY = "pushOptInDismissed";

function sendSubscriptionToBackend(api, sub) {
  const keys = sub?.toJSON?.()?.keys;
  if (!keys?.p256dh || !keys?.auth || !sub?.endpoint) return;
  api.graphQlMutate(
    SAVE_PUSH_SUBSCRIPTION_MUTATION,
    { endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth },
    { context: { nonPublicApi: true } }
  );
}

export function usePushNotifications() {
  const api = useApi();
  const [permission, setPermission] = React.useState(
    getPushPermissionStatus()
  );
  const [vapidKey, setVapidKey] = React.useState(null);
  const [dismissed, setDismissed] = React.useState(
    () => localStorage.getItem(PUSH_OPT_IN_DISMISSED_KEY) === "true"
  );

  React.useEffect(() => {
    if (!isPushSupported()) return;
    fetch(`${API_HOST}/vapid-public-key`)
      .then(res => res.json())
      .then(data => {
        if (data?.publicKey) setVapidKey(data.publicKey);
      })
      .catch(captureSentryException);
  }, []);

  React.useEffect(() => {
    if (!isPushSupported() || !vapidKey || permission !== "granted") return;
    getExistingSubscription()
      .then(sub => sub || subscribeToPush(vapidKey))
      .then(sub => sendSubscriptionToBackend(api, sub))
      .catch(captureSentryException);
  }, [vapidKey, permission]);

  const requestPermission = React.useCallback(async () => {
    if (!vapidKey) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      const sub = await subscribeToPush(vapidKey);
      await sendSubscriptionToBackend(api, sub);
    }
  }, [vapidKey, api]);

  const dismiss = React.useCallback(() => {
    localStorage.setItem(PUSH_OPT_IN_DISMISSED_KEY, "true");
    setDismissed(true);
  }, []);

  const shouldShowOptIn =
    isPushSupported() &&
    permission === "default" &&
    !dismissed &&
    !!vapidKey;

  return {
    isSupported: isPushSupported(),
    permission,
    shouldShowOptIn,
    requestPermission,
    dismiss
  };
}
