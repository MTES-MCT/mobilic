import React from "react";

import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import { FRANCE_CONNECT_LOGIN_MUTATION } from "common/utils/apiQueries";
import { captureSentryException } from "common/utils/sentry";
import { FranceConnectErrorDisplay } from "../common/FranceConnectErrorDisplay";

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
  const [franceConnectError, setFranceConnectError] = React.useState(null);
  const [queryParams, setQueryParams] = React.useState(null);
  const [noAccountError, setNoAccountError] = React.useState(false);

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

        if (
          err.graphQLErrors?.some(e =>
            graphQLErrorMatchesCode(e, "AUTHENTICATION_ERROR")
          )
        ) {
          setNoAccountError(true);
          return;
        }

        setError(formatApiError(err));
      }
    });
  }

  React.useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    setQueryParams(queryString);

    const error = queryString.get("error");
    const errorDescription = queryString.get("error_description");

    if (error) {
      setFranceConnectError({ errorCode: error, errorDescription });
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
      const stateData = JSON.parse(atob(state));
      create = stateData.create === true;
    }

    const newQS = removeParamsFromQueryString(window.location.search, [
      "code",
      "state",
      "iss",
      "error",
      "error_description"
    ]);
    const callBackUrl =
      window.location.origin +
      window.location.pathname +
      (newQS.length > 0 ? `?${newQS}` : "");
    if (code) {
      retrieveFranceConnectInfo(code, callBackUrl, inviteToken, create, state);
    } else setError("Paramètres invalides");
  }, []);

  if (franceConnectError) {
    return (
      <FranceConnectErrorDisplay
        errorCode={franceConnectError.errorCode}
        errorDescription={franceConnectError.errorDescription}
        queryParams={queryParams}
      />
    );
  }

  if (noAccountError && queryParams) {
    return (
      <FranceConnectErrorDisplay
        errorCode="no_account"
        errorDescription="Compte Mobilic requis pour continuer"
        queryParams={queryParams}
        onRedirect={() => {
          const inviteToken = queryParams.get("invite_token");
          const signupUrl = inviteToken
            ? `/signup?invite_token=${inviteToken}`
            : "/signup";
          history.push(signupUrl);
        }}
      />
    );
  }

  return error ? <Typography color="error">{error}</Typography> : null;
}
