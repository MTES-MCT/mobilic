import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { STOP_IMPERSONATION_MUTATION } from "common/utils/apiQueries/impersonation";

export function Logout() {
  const api = useApi();
  const history = useHistory();
  const location = useLocation();
  const withLoadingScreen = useLoadingScreen();
  const store = useStoreSyncedWithLocalStorage();

  async function _logout() {
    const userInfo = store.userInfo();
    if (userInfo?.isImpersonated) {
      try {
        await api.graphQlMutate(
          STOP_IMPERSONATION_MUTATION,
          {},
          { context: { nonPublicApi: true } }
        );
        await store.updateUserIdAndInfo();
        history.replace("/support/impersonation");
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(
          "StopImpersonation failed, falling back to full logout",
          err
        );
        // fall through to the full logout below to leave Kelly in a clean state
      }
    }
    const queryString = new URLSearchParams(location.search);
    const next = queryString.get("next");
    await api.logout({
      postFCLogoutRedirect:
        "/logout" + (next ? `?next=${encodeURIComponent(next)}` : ""),
      failOnError: false
    });
    history.push(next ? decodeURI(next) : "/");
  }

  React.useEffect(() => {
    withLoadingScreen(_logout);
  }, []);

  return null;
}
