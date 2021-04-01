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
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import frLocale from "date-fns/locale/fr";
import { FrLocalizedUtils } from "common/utils/time";
import { ActionsContextProvider } from "common/utils/actions";
import { ModalProvider } from "common/utils/modals";
import {
  LoadingScreenContextProvider,
  useLoadingScreen
} from "common/utils/loading";
import {
  getAccessibleRoutes,
  getFallbackRoute,
  isAccessible
} from "./common/routes";
import { ScrollToTop } from "common/utils/scroll";
import { SnackbarProvider } from "./common/Snackbar";
import { EnvironmentHeader } from "./common/EnvironmentHeader";
import { currentUserId } from "common/utils/cookie";
import {
  MatomoProvider,
  createInstance,
  useMatomo
} from "@datapunt/matomo-tracker-react";

const matomo = createInstance({
  urlBase: "https://stats.data.gouv.fr",
  siteId: 163,
  userId: "UID76903202", // optional, default value: `undefined`.
  trackerUrl: "https://stats.data.gouv.fr/piwik.php", // optional, default value: `${urlBase}matomo.php`
  srcUrl: "https://stats.data.gouv.fr/piwik.js", // optional, default value: `${urlBase}matomo.js`,
  disabled: !process.env.REACT_APP_MATOMO,
  heartBeat: {
    // optional, enabled by default
    active: true, // optional, default value: true
    seconds: 10 // optional, default value: `15
  },
  linkTracking: false // optional, default value: true
});

export default function Root() {
  return (
    <MatomoProvider value={matomo}>
      <StoreSyncedWithLocalStorageProvider storage={localStorage}>
        <Router>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ApiContextProvider>
              <MuiPickersUtilsProvider
                utils={FrLocalizedUtils}
                locale={frLocale}
              >
                <SnackbarProvider>
                  <LoadingScreenContextProvider>
                    <ModalProvider modalDict={MODAL_DICT}>
                      <ActionsContextProvider>
                        <ScrollToTop />
                        <_Root />
                      </ActionsContextProvider>
                    </ModalProvider>
                  </LoadingScreenContextProvider>
                </SnackbarProvider>
              </MuiPickersUtilsProvider>
            </ApiContextProvider>
          </ThemeProvider>
        </Router>
      </StoreSyncedWithLocalStorageProvider>
    </MatomoProvider>
  );
}

function _Root() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();

  const userId = store.userId();
  const userInfo = store.userInfo();
  const companies = store.companies();

  const location = useLocation();
  const history = useHistory();

  const fallbackRoute = getFallbackRoute({
    userInfo,
    companies
  });

  const loadedLocationRef = React.useRef(null);
  const loadedLocation = loadedLocationRef.current;

  const { enableLinkTracking, pushInstruction, trackPageView } = useMatomo();

  enableLinkTracking();

  const loadUserAndRoute = async () => {
    const isSigningUp = location.pathname.startsWith("/signup");
    const isInOauthFlow = location.pathname.startsWith("/oauth");
    const queryString = new URLSearchParams(location.search);

    const isLoggingOut = location.pathname.startsWith("/logout");
    const isInControl = location.pathname.startsWith("/control");
    if (isLoggingOut || isInControl) {
      return;
    }
    if (!document.hidden && !isInOauthFlow) {
      await loadUserData(api, store);
    }
    if (!isSigningUp && !isInOauthFlow) {
      // Routing priority :
      // 1) if there is a next URL (after login) redirect to this one
      // 2) if current URL is accessible keep it
      // 3) redirect to fallback
      const nextLocation = queryString.get("next");
      if (nextLocation) history.replace(nextLocation, location.state);
      else if (
        loadedLocation &&
        isAccessible(loadedLocation, {
          userInfo: store.userInfo(),
          companies: store.companies()
        }) &&
        loadedLocation !== location.pathname + location.search
      ) {
        history.replace(loadedLocation, location.state);
      } else {
        history.replace(
          getFallbackRoute({
            userInfo: store.userInfo(),
            companies: store.companies()
          }),
          location.state
        );
      }
    }
    loadedLocationRef.current = null;
    if (!document.hidden) api.executePendingRequests();
  };

  React.useEffect(() => {
    if (
      !currentUserId() &&
      (location.pathname.startsWith("/app") ||
        location.pathname.startsWith("/admin"))
    )
      history.replace(
        "/login?next=" + encodeURIComponent(location.pathname + location.search)
      );
    else if (
      location.pathname !== "/" &&
      !location.pathname.startsWith("/control") &&
      !location.pathname.startsWith("/login") &&
      !location.pathname.startsWith("/logout") &&
      !location.pathname.startsWith("/activate_email") &&
      !location.pathname.startsWith("/redeem_invite") &&
      !location.pathname.startsWith("/fc-callback")
    )
      loadedLocationRef.current = location.pathname + location.search;
  }, []);

  React.useEffect(() => {
    const uid = currentUserId();
    if (uid) pushInstruction("setUserId", uid);
    else pushInstruction("resetUserId");
    trackPageView({
      documentTitle: document.location.pathname
    });
  }, [location]);

  React.useEffect(() => {
    withLoadingScreen(
      async () => {
        const latestUserId = store.userId();
        if (latestUserId) await loadUserAndRoute();
      },
      "loadUser",
      false
    );
    return () => {};
  }, [userId]);

  const routes = getAccessibleRoutes({ userInfo, companies });

  return (
    <>
      {(process.env.REACT_APP_SENTRY_ENVIRONMENT === "staging" ||
        process.env.REACT_APP_SENTRY_ENVIRONMENT === "sandbox") && (
        <EnvironmentHeader />
      )}
      <Switch>
        {routes.map(route => (
          <Route
            key={route.path}
            exact={route.exact || false}
            path={route.path}
          >
            {route.component}
          </Route>
        ))}
        <Redirect key="default" from="*" to={fallbackRoute} />
      </Switch>
    </>
  );
}
