import React from "react";

import { useLocation, useHistory } from "react-router-dom";
import { useLoadingScreen } from "common/utils/loading";
import { useApi } from "common/utils/api";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { formatApiError } from "common/utils/errors";
import Typography from "@mui/material/Typography";
import { currentUserId } from "common/utils/cookie";

import {
  GET_EMPLOYMENT_QUERY,
  REDEEM_INVITE_QUERY
} from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";
import { usePageTitle } from "../common/UsePageTitle";

export function RedeemInvite() {
  usePageTitle("Lien d'activation - Mobilic");
  const location = useLocation();
  const withLoadingScreen = useLoadingScreen();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const history = useHistory();

  const [error, setError] = React.useState("");

  async function redeemInvite(token) {
    await withLoadingScreen(async () => {
      try {
        const isAuthenticated = await api.checkAuthentication();
        const userId = currentUserId();
        const employment = await api.graphQlQuery(
          GET_EMPLOYMENT_QUERY,
          {
            token
          },
          { context: { nonPublicApi: true } }
        );
        const employmentUserId = employment.data.employment.userId;
        let shouldLoadUser = !isAuthenticated || !userId;
        if (
          employmentUserId &&
          isAuthenticated &&
          employmentUserId !== userId
        ) {
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
          await store.updateEntityObject({
            objectId: employment.data.employment.id,
            entity: "employments",
            update: apiResponse.data.signUp.redeemInvite,
            createOrReplace: true
          });
          store.batchUpdate();
        } else await store.updateUserIdAndInfo();
        await broadCastChannel.postMessage("update");
        history.push("/home");
      } catch (err) {
        captureSentryException(err);
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
