import React from "react";

import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import { FRANCE_CONNECT_LOGIN_MUTATION } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";

export function removeParamsFromQueryString(qs, params) {
  const qsWithoutQuestionMark = qs.startsWith("?") ? qs.slice(1) : qs;
  const filteredQsParams = qsWithoutQuestionMark
    .split("&")
    .map(p => p.split("="))
    .filter(p => !params.includes(p[0]));
  return filteredQsParams.map(p => p.join("=")).join("&");
}

export function FranceConnectCallback() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();
  const history = useHistory();

  const [error, setError] = React.useState("");

  async function retrieveFranceConnectInfo(
    code,
    callbackURL,
    token,
    create,
    state
  ) {
    await withLoadingScreen(async () => {
      try {
        await api.graphQlMutate(
          FRANCE_CONNECT_LOGIN_MUTATION,
          {
            inviteToken: token,
            originalRedirectUri: callbackURL,
            authorizationCode: code,
            create: create,
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

    const error = queryString.get("error");
    const errorDescription = queryString.get("error_description");

    if (error) {
      const errorMessage = `Erreur d'authentification FranceConnect: ${error}`;
      const details = errorDescription ? ` - ${errorDescription}` : "";
      setError(errorMessage + details);
      return;
    }

    const inviteToken = queryString.get("invite_token");
    const code = queryString.get("code");
    const context = queryString.get("context");
    let create = queryString.get("create") === "true";
    const state = queryString.get("state");

    if (context === "signup") {
      create = true;
    } else if (context === "login") {
      create = false;
    } else if (!create && state) {
      // eslint-disable-next-line
      const stateData = JSON.parse(atob(state));
      create = stateData.create === true;
    }

    // Clean v1/v2 parameters from URL
    const newQS = removeParamsFromQueryString(window.location.search, [
      "code",
      "state",
      "iss", // v1 parameter
      "error", // v2 parameter
      "error_description" // v2 parameter
    ]);

    const callBackUrl =
      window.location.origin +
      window.location.pathname +
      (newQS.length > 0 ? `?${newQS}` : "");

    if (code) {
      retrieveFranceConnectInfo(code, callBackUrl, inviteToken, create, state);
    } else if (!error) {
      setError("Paramètres invalides");
    }
  }, []);

  return error ? <Typography color="error">{error}</Typography> : null;
}
