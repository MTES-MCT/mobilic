import React from "react";

import { useLocation, useHistory } from "react-router-dom";
import { useLoadingScreen } from "common/utils/loading";
import {
  GET_EMPLOYMENT_QUERY,
  REDEEM_INVITE_QUERY,
  useApi
} from "common/utils/api";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/utils/store";
import { formatApiError } from "common/utils/errors";
import Typography from "@material-ui/core/Typography";
import { currentUserId } from "common/utils/cookie";
import * as Sentry from "@sentry/browser";

export function RedeemInvite() {
  const location = useLocation();
  const withLoadingScreen = useLoadingScreen();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const history = useHistory();

  const [error, setError] = React.useState("");

  async function redeemInvite(token) {
    await withLoadingScreen(async () => {
      try {
        const userId = currentUserId();
        const employment = await api.graphQlQuery(
          GET_EMPLOYMENT_QUERY,
          {
            token
          },
          { context: { nonPublicApi: true } }
        );
        const employmentUserId = employment.data.employment.userId;
        let shouldLoadUser = !userId;
        if (employmentUserId && employmentUserId !== userId) {
          await api.logout({
            postFCLogoutRedirect: `/logout?next=${encodeURIComponent(
              "/redeem_invite?token=" + token
            )}`
          });
          shouldLoadUser = true;
        }
        const apiResponse = await api.graphQlMutate(
          REDEEM_INVITE_QUERY,
          {
            token
          },
          { context: { nonPublicApi: true } }
        );
        if (!shouldLoadUser) {
          await store.syncEntity(
            [apiResponse.data.signUp.redeemInvite],
            "employments",
            () => false
          );
        } else await store.updateUserIdAndInfo();
        await broadCastChannel.postMessage("update");
        history.push("/home");
      } catch (err) {
        Sentry.captureException(err);
        setError(formatApiError(err));
      }
    });
  }

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const token = queryString.get("token");

    if (token) {
      redeemInvite(token);
      return () => {};
    } else setError("Lien d'invitation manquant");
  }, []);

  return error ? (
    <Typography color="error">
      Impossible de valider l'invitation pour la raison suivante : {error}
    </Typography>
  ) : null;
}
