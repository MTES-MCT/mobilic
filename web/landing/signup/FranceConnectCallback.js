import React from "react";

import { FRANCE_CONNECT_LOGIN_MUTATION, useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { formatApiError } from "common/utils/errors";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@material-ui/core/Typography";

export function FranceConnectCallback() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();

  const [error, setError] = React.useState("");

  async function retrieveFranceConnectInfo(code, callbackURL, token, create) {
    await withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          FRANCE_CONNECT_LOGIN_MUTATION,
          {
            inviteToken: token,
            originalRedirectUri: callbackURL,
            authorizationCode: code,
            create: !!create
          },
          { context: { nonPublicApi: true } }
        );
        const {
          accessToken,
          refreshToken
        } = apiResponse.data.auth.franceConnectLogin;
        await store.storeTokens({
          accessToken,
          refreshToken
        });
      } catch (err) {
        setError(formatApiError(err));
        console.log(err);
      }
    });
  }

  React.useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const inviteToken = queryString.get("invite_token");
    const code = queryString.get("code");
    const create = queryString.get("create");
    queryString.delete("code");
    queryString.delete("state");
    const newQS = queryString.toString();
    const callBackUrl = decodeURIComponent(
      window.location.origin +
        window.location.pathname +
        (newQS.length > 0 ? `?${newQS}` : "")
    );

    if (code) {
      retrieveFranceConnectInfo(code, callBackUrl, inviteToken, create);
    } else setError("Erreur avec France Connect");
  }, []);

  return error ? <Typography color="error">{error}</Typography> : null;
}
