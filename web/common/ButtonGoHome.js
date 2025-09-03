import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { getFallbackRoute } from "./routes";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { loadUserData } from "common/utils/loadUserData";
import { captureSentryException } from "common/utils/sentry";

const ButtonGoHome = () => {
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  const handleClick = async () => {
    await withLoadingScreen(async () => {
      const isAuthenticated = await api.checkAuthentication();
      if (isAuthenticated) {
        try {
          await loadUserData(api, store);
        } catch (error) {
          captureSentryException(error);
        }
      }

      const userInfo = store.userInfo();
      const companies = store.companies();
      const fallbackRoute = getFallbackRoute({
        userInfo,
        companies,
        controllerInfo: null
      });
      history.push(fallbackRoute);
    });
  };

  return (
    <Button onClick={handleClick} style={{ margin: "auto" }}>
      Aller dans mon espace
    </Button>
  );
};

export default ButtonGoHome;
