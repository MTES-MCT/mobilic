import React from "react";

import { FRANCE_CONNECT_LOGIN_MUTATION, useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@material-ui/core/Typography";

export function FranceConnectCallback() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();

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
        const apiResponse = await api.graphQlMutate(
          FRANCE_CONNECT_LOGIN_MUTATION,
          {
            inviteToken: token,
            originalRedirectUri: callbackURL,
            authorizationCode: code,
            create: !!create,
            state
          },
          { context: { nonPublicApi: true } }
        );
        await store.storeTokens(apiResponse.data.auth.franceConnectLogin);
      } catch (err) {
        setError(
          formatApiError(err, gqlError => {
            if (graphQLErrorMatchesCode(gqlError, "AUTHENTICATION_ERROR")) {
              return "Vous n'avez pas encore de compte. Veuillez vous inscrire.";
            }
          })
        );
        console.log(err);
      }
    });
  }

  React.useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const inviteToken = queryString.get("invite_token");
    const code = queryString.get("code");
    const create = queryString.get("create");
    const state = queryString.get("state");
    queryString.delete("code");
    queryString.delete("state");
    const newQS = queryString.toString();
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
