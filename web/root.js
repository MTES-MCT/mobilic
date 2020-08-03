import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
  useHistory
} from "react-router-dom";

import "common/assets/fonts/Evolventa/Evolventa-Bold.ttf";
import "common/assets/fonts/Evolventa/Evolventa-BoldOblique.ttf";
import "common/assets/fonts/Evolventa/Evolventa-Oblique.ttf";
import "common/assets/fonts/Evolventa/Evolventa-Regular.ttf";
import "common/assets/fonts/Source Sans Pro/SourceSansPro-Bold.otf";
import "common/assets/fonts/Source Sans Pro/SourceSansPro-It.otf";
import "common/assets/fonts/Source Sans Pro/SourceSansPro-Regular.otf";

import "./index.css";
import "common/assets/styles/root.scss";

import {
  StoreSyncedWithLocalStorageProvider,
  useStoreSyncedWithLocalStorage
} from "common/utils/store";
import { ApiContextProvider, useApi } from "common/utils/api";
import { theme } from "common/utils/theme";
import { MODAL_DICT } from "./modals";
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import { loadUserData } from "common/utils/loadUserData";
import Container from "@material-ui/core/Container";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import frLocale from "date-fns/locale/fr";
import { FrLocalizedUtils } from "common/utils/time";
import { ActionsContextProvider } from "common/utils/actions";
import { ModalProvider } from "common/utils/modals";
import {
  LoadingScreenContextProvider,
  useLoadingScreen
} from "common/utils/loading";
import { getAccessibleRoutes, getFallbackRoute } from "./common/routes";

export default function Root() {
  return (
    <Container className="root-container" maxWidth={false}>
      <StoreSyncedWithLocalStorageProvider storage={localStorage}>
        <Router>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ApiContextProvider>
              <MuiPickersUtilsProvider
                utils={FrLocalizedUtils}
                locale={frLocale}
              >
                <ModalProvider modalDict={MODAL_DICT}>
                  <LoadingScreenContextProvider>
                    <ActionsContextProvider>
                      <_Root />
                    </ActionsContextProvider>
                  </LoadingScreenContextProvider>
                </ModalProvider>
              </MuiPickersUtilsProvider>
            </ApiContextProvider>
          </ThemeProvider>
        </Router>
      </StoreSyncedWithLocalStorageProvider>
    </Container>
  );
}

function _Root() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();

  const userId = store.userId();
  const userInfo = store.userInfo();
  const companyInfo = store.companyInfo();
  const isSigningUp = store.isSigningUp();

  const location = useLocation();
  const history = useHistory();

  const fallbackRoute = getFallbackRoute({
    userInfo,
    companyInfo,
    isSigningUp
  });

  const loadUser = () =>
    withLoadingScreen(async () => {
      const isLoggingIn = location.pathname.startsWith("/login");
      const queryString = new URLSearchParams(location.search);

      await loadUserData(api, store);
      if (isLoggingIn) {
        const nextLocation = queryString.get("next");
        history.push(
          nextLocation
            ? decodeURI(nextLocation)
            : getFallbackRoute({
                userInfo: store.userInfo(),
                companyInfo: store.companyInfo()
              })
        );
      }
    });

  React.useEffect(() => {
    if (userId) loadUser();
    return () => {};
  }, [userId]);

  const routes = getAccessibleRoutes({ userInfo, companyInfo, isSigningUp });

  return (
    <Switch>
      {routes.map(route => (
        <Route key={route.path} path={route.path}>
          {route.component}
        </Route>
      ))}
      <Redirect push key="default" from="*" to={fallbackRoute} />
    </Switch>
  );
}
