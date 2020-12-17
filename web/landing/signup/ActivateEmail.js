import React from "react";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/utils/store";
import { useLocation, useHistory } from "react-router-dom";
import { ACTIVATE_EMAIL_MUTATION, useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { formatApiError } from "common/utils/errors";
import Typography from "@material-ui/core/Typography";
import jwt_decode from "jwt-decode";
import { currentUserId } from "common/utils/cookie";
import * as Sentry from "@sentry/browser";

export function ActivateEmail() {
  const location = useLocation();
  const history = useHistory();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();

  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const token = queryString.get("token");

    if (!token) setError("Jeton d'activation manquant");
    else {
      let userId;
      try {
        const decodedToken = jwt_decode(token);
        userId = decodedToken["user_id"];
      } catch (err) {
        Sentry.captureException(err);
        setError("Jeton d'activation invalide");
      }

      if (userId) {
        withLoadingScreen(async () => {
          const isAuthenticated = await api.checkAuthentication();
          // If a differrent user is authenticated, logout
          if (isAuthenticated && currentUserId() !== userId) {
            await api.logout(
              `/logout?next=${encodeURIComponent(
                "/activate_email?token=" + token
              )}`
            );
          }
          try {
            const apiResponse = await api.graphQlMutate(
              ACTIVATE_EMAIL_MUTATION,
              { token },
              { context: { nonPublicApi: true } }
            );
            if (!isAuthenticated) {
              await store.updateUserIdAndInfo();
            } else {
              await store.setUserInfo({
                ...store.userInfo(),
                ...apiResponse.data.signUp.activateEmail
              });
            }
            await broadCastChannel.postMessage("update");
            history.push("/home");
          } catch (err) {
            Sentry.captureException(err);
            console.log(err);
            setError(formatApiError(err));
          }
        });
      }
    }
  }, []);

  return error ? (
    <Typography color="error">
      Impossible de valider l'activation pour la raison suivante : {error}
    </Typography>
  ) : null;
}
