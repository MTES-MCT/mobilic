import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
  useHistory
} from "react-router-dom";
import {
  StoreSyncedWithLocalStorageProvider,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { ApiContextProvider, useApi } from "common/utils/api";
import { customOptions } from "common/utils/theme";
import { MODAL_DICT } from "./modals";
import { StyledEngineProvider, CssBaseline } from "@mui/material";
import { loadUserData } from "common/utils/loadUserData";
import frLocale from "date-fns/locale/fr";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ModalProvider } from "common/utils/modals";
import {
  LoadingScreenContextProvider,
  useLoadingScreen
} from "common/utils/loading";
import {
  CONTROLLER_ROUTE_PREFIX,
  getAccessibleRoutes,
  getFallbackRoute,
  isAccessible
} from "./common/routes";
import { ScrollToTop } from "common/utils/scroll";
import { SnackbarProvider, useSnackbarAlerts } from "./common/Snackbar";
import { EnvironmentHeader } from "./common/EnvironmentHeader";
import { LiveChat } from "./common/LiveChat";
import {
  currentControllerId,
  currentUserId,
  hasGoogleAdsConsent
} from "common/utils/cookie";
import {
  MatomoProvider,
  createInstance,
  useMatomo
} from "@datapunt/matomo-tracker-react";
import { Crisp } from "crisp-sdk-web";
import CircularProgress from "@mui/material/CircularProgress";
import { ErrorBoundary } from "./common/ErrorFallback";
import { RegulationDrawerContextProvider } from "./landing/ResourcePage/RegulationDrawer";
import { isGoogleAdsInitiated, initGoogleAds } from "common/utils/trackAds";
import { createMuiDsfrThemeProvider } from "@codegouvfr/react-dsfr/mui";
import "./index.css";
import "common/assets/styles/root.scss";
import { loadControllerUserData } from "./controller/utils/loadControllerUserData";
import { LocalizationProvider, frFR } from "@mui/x-date-pickers";
import { shouldUpdatePassword } from "common/utils/updatePassword";
import UpdatePasswordModal from "./pwa/components/UpdatePassword";
import AcceptCguModal from "./pwa/modals/AcceptCguModal";
import RejectedCguModal from "./pwa/modals/RejectedCguModals";

const matomo = createInstance({
  urlBase: "https://stats.beta.gouv.fr",
  siteId: 75,
  // userId: 'UIDC2DH', // optional, default value: `undefined`.
  // trackerUrl: 'https://LINK.TO.DOMAIN/tracking.php', // optional, default value: `${urlBase}matomo.php`
  // srcUrl: 'https://LINK.TO.DOMAIN/tracking.js', // optional, default value: `${urlBase}matomo.js`
  disabled: !process.env.REACT_APP_MATOMO,
  heartBeat: {
    // optional, enabled by default
    active: true, // optional, default value: true
    seconds: 10 // optional, default value: `15
  },
  linkTracking: false // optional, default value: true
});

const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider({
  augmentMuiTheme: ({ nonAugmentedMuiTheme, frColorTheme }) => ({
    ...nonAugmentedMuiTheme,
    custom: customOptions
  })
});

export default function Root() {
  return (
    <MatomoProvider value={matomo}>
      <StoreSyncedWithLocalStorageProvider storage={localStorage}>
        <Router>
          <StyledEngineProvider injectFirst>
            <MuiDsfrThemeProvider>
              <CssBaseline />
              <ErrorBoundary>
                <ApiContextProvider>
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={frLocale}
                    localeText={
                      frFR.components.MuiLocalizationProvider.defaultProps
                        .localeText
                    }
                  >
                    <SnackbarProvider>
                      <LoadingScreenContextProvider>
                        <ModalProvider modalDict={MODAL_DICT}>
                          <RegulationDrawerContextProvider>
                            <ScrollToTop />
                            <_Root />
                          </RegulationDrawerContextProvider>
                        </ModalProvider>
                      </LoadingScreenContextProvider>
                    </SnackbarProvider>
                  </LocalizationProvider>
                </ApiContextProvider>
              </ErrorBoundary>
            </MuiDsfrThemeProvider>
          </StyledEngineProvider>
        </Router>
      </StoreSyncedWithLocalStorageProvider>
    </MatomoProvider>
  );
}

function _Root() {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  const userId = store.userId();
  const controllerId = store.controllerId();
  const userInfo = store.userInfo();
  const controllerInfo = store.controllerInfo();
  const companies = store.companies();

  const location = useLocation();
  const history = useHistory();

  const fallbackRoute = getFallbackRoute({
    userInfo,
    companies,
    controllerInfo
  });

  const loadedLocationRef = React.useRef(null);
  const loadedLocation = loadedLocationRef.current;

  const { enableLinkTracking, pushInstruction, trackPageView } = useMatomo();

  enableLinkTracking();

  const loadControllerAndRoute = async () => {
    const queryString = new URLSearchParams(location.search);

    await loadControllerUserData(api, store, alerts);

    const nextLocation = queryString.get("next");
    if (nextLocation) {
      history.replace(nextLocation, location.state);
    } else if (
      loadedLocation &&
      isAccessible(loadedLocation, {
        controllerInfo: store.controllerInfo()
      })
    ) {
      history.replace(loadedLocation, location.state);
    } else {
      history.replace(fallbackRoute, location.state);
    }
    loadedLocationRef.current = null;
  };

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
      await loadUserData(api, store, alerts);
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
        })
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
  };

  React.useEffect(() => {
    if (
      process.env.REACT_APP_GOOGLE_ADS &&
      !isGoogleAdsInitiated() &&
      hasGoogleAdsConsent()
    ) {
      initGoogleAds();
    }
    if (
      !currentUserId() &&
      (location.pathname.startsWith("/app") ||
        location.pathname.startsWith("/home") ||
        location.pathname.startsWith("/admin"))
    ) {
      history.replace(
        "/login?next=" + encodeURIComponent(location.pathname + location.search)
      );
    } else if (
      !currentControllerId() &&
      location.pathname.startsWith(CONTROLLER_ROUTE_PREFIX + "/")
    ) {
      history.replace(
        "/controller-login?next=" +
          encodeURIComponent(location.pathname + location.search)
      );
    } else if (
      location.pathname !== "/" &&
      (!location.pathname.startsWith("/control/user-history") ||
        location.pathname.startsWith(CONTROLLER_ROUTE_PREFIX)) &&
      !location.pathname.startsWith("/login") &&
      !location.pathname.startsWith("/controller-login") &&
      !location.pathname.startsWith("/logout") &&
      !location.pathname.startsWith("/activate_email") &&
      !location.pathname.startsWith("/redeem_invite") &&
      !location.pathname.startsWith("/fc-callback") &&
      !location.pathname.startsWith("/ac-callback")
    ) {
      loadedLocationRef.current = location.pathname + location.search;
    }
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
        if (userId && store.userId()) {
          Crisp.session.setData({
            mobilic_id: userId,
            metabase_link:
              "https://metabase.mobilic.beta.gouv.fr/dashboard/6?id=" + userId
          });
          await loadUserAndRoute();
        }
      },
      { cacheKey: "loadUser" + userId },
      false
    );
  }, [userId]);

  React.useEffect(() => {
    withLoadingScreen(
      async () => {
        if (controllerId && store.controllerId())
          await loadControllerAndRoute();
      },
      { cacheKey: "loadController" + controllerId },
      false
    );
  }, [controllerId]);

  const [seeAgainCgu, setSeeAgainCgu] = React.useState(false);

  const shouldSeeCguModal = React.useMemo(
    () => userInfo?.userAgreementStatus?.shouldAcceptCgu || seeAgainCgu,
    [userInfo?.userAgreementStatus?.shouldAcceptCgu, seeAgainCgu]
  );
  const shouldSeeHasRejectedCguModal = React.useMemo(
    () => !seeAgainCgu && userInfo?.userAgreementStatus?.hasRejectedCgu,
    [userInfo?.userAgreementStatus?.hasRejectedCgu, seeAgainCgu]
  );

  const routes = getAccessibleRoutes({ userInfo, companies, controllerInfo });

  return (
    <>
      {(process.env.REACT_APP_SENTRY_ENVIRONMENT === "staging" ||
        process.env.REACT_APP_SENTRY_ENVIRONMENT === "sandbox") && (
        <EnvironmentHeader />
      )}
      {process.env.REACT_APP_CRISP_AUTOLOAD !== "1" &&
        process.env.REACT_APP_CRISP_WEBSITE_ID &&
        !controllerId && <LiveChat />}
      {store.userId() && shouldSeeCguModal && (
        <AcceptCguModal
          onAccept={() => setSeeAgainCgu(false)}
          onReject={() => setSeeAgainCgu(false)}
        />
      )}
      {store.userId() && shouldSeeHasRejectedCguModal && (
        <RejectedCguModal
          expiryDate={userInfo?.userAgreementStatus?.expiresAt}
          onRevert={() => setSeeAgainCgu(true)}
          userId={userId}
        />
      )}
      {store.userId() && shouldUpdatePassword() && <UpdatePasswordModal />}
      <React.Suspense fallback={<CircularProgress color="primary" />}>
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
          <Route path="*" render={() => <Redirect to={fallbackRoute} />} />
        </Switch>
      </React.Suspense>
    </>
  );
}
