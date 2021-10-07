import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useLocation, useHistory } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import Typography from "@material-ui/core/Typography";
import jwt_decode from "jwt-decode";
import { currentUserId } from "common/utils/cookie";

import { useSnackbarAlerts } from "../common/Snackbar";
import { ACTIVATE_EMAIL_MUTATION } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";

export function ActivateEmail() {
  const location = useLocation();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const history = useHistory();

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
        captureSentryException(err);
        setError("Jeton d'activation invalide");
      }

      if (userId) {
        withLoadingScreen(async () => {
          let isAuthenticated = await api.checkAuthentication();
          // If a differrent user is authenticated, logout
          if (isAuthenticated && currentUserId() !== userId) {
            await api.logout({
              postFCLogoutRedirect: `/logout?next=${encodeURIComponent(
                "/activate_email?token=" + token
              )}`
            });
            isAuthenticated = false;
          }
          await alerts.withApiErrorHandling(
            async () => {
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
            },
            "activate-link",
            gqlError => {
              if (graphQLErrorMatchesCode(gqlError, "INVALID_TOKEN")) {
                return "Le lien d'activation est invalide.";
              }
              if (graphQLErrorMatchesCode(gqlError, "EXPIRED_TOKEN")) {
                return "Le lien d'activation a expiré.";
              }
            },
            () => {
              setError("erreur");
              history.push("/");
            }
          );
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
