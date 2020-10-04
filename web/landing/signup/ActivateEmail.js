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
      setTimeout(
        () =>
          withLoadingScreen(async () => {
            const isAuthenticated = await api.checkAuthentication();
            if (!isAuthenticated) {
              history.push(
                `/login?next=${encodeURIComponent(
                  "/activate_email?token=" + token
                )}`
              );
            } else {
              try {
                const apiResponse = await api.graphQlMutate(
                  ACTIVATE_EMAIL_MUTATION,
                  { token },
                  { context: { nonPublicApi: true } }
                );
                await store.setUserInfo({
                  ...store.userInfo(),
                  ...apiResponse.data.signUp.activateEmail
                });
                await broadCastChannel.postMessage("update");
                history.push("/home");
              } catch (err) {
                setError(formatApiError(err));
              }
            }
          }),
        200
      );
    }
  }, []);

  return error ? (
    <Typography color="error">
      Impossible de valider l'activation pour la raison suivante : {error}
    </Typography>
  ) : null;
}
