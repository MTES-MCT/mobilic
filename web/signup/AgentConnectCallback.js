import React from "react";

import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@mui/material/Typography";
import { AGENT_CONNECT_LOGIN_MUTATION } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";
import { removeParamsFromQueryString } from "./FranceConnectCallback";

export function AgentConnectCallback() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();

  const [error, setError] = React.useState("");

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
        setError(
          formatApiError(err, gqlError => {
            if (graphQLErrorMatchesCode(gqlError, "AUTHENTICATION_ERROR")) {
              return "Erreur lors de la connexion à Mobilic, veuillez réessayer plus tard.";
            }
          })
        );
      }
    });
  }

  React.useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const code = queryString.get("code");
    const state = queryString.get("state");
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
    } else setError("Paramètres invalides");
  }, []);

  return error ? <Typography color="error">{error}</Typography> : null;
}
