import React from "react";

import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import { AGENT_CONNECT_LOGIN_MUTATION } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";

function removeParamsFromQueryString(qs, params) {
  const qsWithoutQuestionMark = qs.startsWith("?") ? qs.slice(1) : qs;
  const filteredQsParams = qsWithoutQuestionMark
    .split("&")
    .map(p => p.split("="))
    .filter(p => !params.includes(p[0]));
  return filteredQsParams.map(p => p.join("=")).join("&");
}

export function AgentConnectCallback() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();
  const history = useHistory();

  const [error, setError] = React.useState("");

  async function retrieveFranceConnectInfo(code, callbackURL, create, state) {
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
        await store.updateUserIdAndInfo();
        if (create) history.push("/signup/user_login");
      } catch (err) {
        captureSentryException(err);
        setError(
          formatApiError(err, gqlError => {
            if (graphQLErrorMatchesCode(gqlError, "AUTHENTICATION_ERROR")) {
              return "Vous n'avez pas encore de compte sur Mobilic. Veuillez vous inscrire.";
            }
          })
        );
      }
    });
  }

  React.useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const inviteToken = queryString.get("invite_token");
    const code = queryString.get("code");
    const create = queryString.get("create");
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
      retrieveFranceConnectInfo(code, callBackUrl, inviteToken, create, state);
    } else setError("Paramètres invalides");
  }, []);

  return error ? <Typography color="error">{error}</Typography> : null;
}