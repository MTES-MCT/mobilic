import React from "react";

import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@mui/material/Typography";
import { AGENT_CONNECT_LOGIN_MUTATION } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";
import { removeParamsFromQueryString } from "./FranceConnectCallback";
import { useSnackbarAlerts } from "../common/Snackbar";
import { useHistory } from "react-router-dom";
import { Link } from "../common/LinkButton";

export function AgentConnectCallback() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const history = useHistory();

  const [error, setError] = React.useState("");
  const MESSAGE_WHEN_USER_ABORT_CONNEXION = "User auth aborted";

  async function retrieveAgentConnectInfo(code, callbackURL, state) {
    await withLoadingScreen(async () => {
      try {
        await api.graphQlMutate(
          AGENT_CONNECT_LOGIN_MUTATION,
          {
            originalRedirectUri: callbackURL,
            authorizationCode: code,
            state
          },
          { context: { nonPublicApi: true } },
          true
        );
        await store.updateControllerIdAndInfo();
      } catch (err) {
        captureSentryException(err);
        alerts.error(
          formatApiError(err, gqlError => {
            if (graphQLErrorMatchesCode(gqlError, "AUTHENTICATION_ERROR")) {
              return "Erreur lors de la connexion à Mobilic, veuillez réessayer plus tard.";
            }
          }),
          "",
          6000
        );
        history.push("/controller-login");
      }
    });
  }

  React.useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const code = queryString.get("code");
    const state = queryString.get("state");
    const errorDescription = queryString.get("error_description");
    const newQS = removeParamsFromQueryString(window.location.search, [
      "code",
      "state"
    ]);
    const callBackUrl =
      window.location.origin +
      window.location.pathname +
      (newQS.length > 0 ? `?${newQS}` : "");
    if (code) {
      retrieveAgentConnectInfo(code, callBackUrl, state);
    } else if (errorDescription === MESSAGE_WHEN_USER_ABORT_CONNEXION) {
      history.push("/");
    } else {
      setError("Paramètres invalides");
    }
  }, []);

  return error ? (
    <>
      <Typography color="error">{error}</Typography>
      <Link href={window.location.origin}>Retourner à la page d'accueil</Link>
    </>
  ) : null;
}
