import React from "react";

import { useLocation, useHistory } from "react-router-dom";
import { useLoadingScreen } from "common/utils/loading";
import { REDEEM_INVITE_QUERY, useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { formatApiError } from "common/utils/errors";
import Typography from "@material-ui/core/Typography";

export function RedeemInvite() {
  const location = useLocation();
  const withLoadingScreen = useLoadingScreen();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const history = useHistory();

  const [error, setError] = React.useState("");

  async function redeemInvite(token) {
    await withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          REDEEM_INVITE_QUERY,
          {
            inviteToken: token
          },
          { context: { nonPublicApi: true } }
        );
        await store.syncEntity(
          [apiResponse.data.signUp.redeemInvite],
          "employments",
          () => false
        );
        history.push("/home");
      } catch (err) {
        setError(formatApiError(err));
      }
    });
  }

  React.useEffect(async () => {
    const queryString = new URLSearchParams(location.search);
    const token = queryString.get("token");

    if (token) {
      redeemInvite(token);
    } else setError("Jeton d'invitation manquant");
  }, []);

  return error ? (
    <Typography color="error">
      Impossible de valider l'invitation pour la raison suivante : {error}
    </Typography>
  ) : null;
}
