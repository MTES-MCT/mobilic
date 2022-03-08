import React from "react";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation
} from "react-router-dom";
import Container from "@mui/material/Container";
import "./assets/admin.scss";
import { loadCompaniesData } from "./utils/loadCompaniesData";
import { useApi } from "common/utils/api";
import { AdminStoreProvider, useAdminStore } from "./store/store";
import {
  LoadingScreenContextProvider,
  useLoadingScreen
} from "common/utils/loading";

import { Header } from "../common/Header";
import { makeStyles } from "@mui/styles";
import useTheme from "@mui/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { SideMenu } from "./components/SideMenu";
import { useSnackbarAlerts } from "../common/Snackbar";
import { DAY, isoFormatLocalDate } from "common/utils/time";
import { ADMIN_VIEWS } from "./utils/navigation";
import { ADMIN_ACTIONS } from "./store/reducers/root";
import { MissionDrawerContextProvider } from "./components/MissionDrawer";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    alignItems: "stretch",
    overflowY: "hidden"
  },
  panelContainer: {
    flex: "100 1 auto",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  }
}));

/**
 * Be careful using this hook. It only works because the number of
 * breakpoints in theme is static. It will break once you change the number of
 * breakpoints. See https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
 */
function useWidth() {
  const theme = useTheme();
  const keys = [...theme.breakpoints.keys].reverse();
  return (
    keys.reduce((output, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useMediaQuery(theme.breakpoints.up(key));
      return !output && matches ? key : output;
    }, null) || "xs"
  );
}

function useIsWidthUp(breakpoint) {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
}

function _Admin() {
  const api = useApi();
  const adminStore = useAdminStore();
  const withLoadingScreen = useLoadingScreen();
  const { path } = useRouteMatch();
  const alerts = useSnackbarAlerts();

  const classes = useStyles();
  const [shouldRefreshData, setShouldRefreshData] = React.useState({
    value: true
  });

  const location = useLocation();
  const width = useWidth();
  const isMdUp = useIsWidthUp("md");

  const views = ADMIN_VIEWS.map(view => {
    const absPath = `${path}${view.path}`;
    return {
      ...view,
      path: absPath
    };
  });

  async function loadData() {
    const userId = adminStore.userId;
    if (userId) {
      setShouldRefreshData({ value: false });
      shouldRefreshData.value = false;
      withLoadingScreen(
        async () =>
          await alerts.withApiErrorHandling(
            async () => {
              const minDate = isoFormatLocalDate(
                new Date(Date.now() - DAY * 1000 * 150)
              );
              const companies = await loadCompaniesData(api, userId, minDate);
              adminStore.dispatch({
                type: ADMIN_ACTIONS.syncStore,
                payload: { companiesPayload: companies, minDate }
              });
            },
            "load-companies",
            null,
            () => setShouldRefreshData(true)
          )
      );
    }
  }

  React.useEffect(() => {
    if (shouldRefreshData.value) loadData();
  }, [adminStore.userId]);

  React.useEffect(() => {
    if (
      location.pathname.startsWith("/admin/activities") &&
      shouldRefreshData.value
    )
      loadData();
  }, [location]);

  const ref = React.useRef(null);

  const shouldRefreshDataSetter = val => setShouldRefreshData({ value: val });

  const defaultView = views.find(view => view.isDefault);
  return [
    <Header key={0} />,
    <MissionDrawerContextProvider
      key={1}
      width={width}
      setShouldRefreshData={shouldRefreshDataSetter}
    >
      <Container
        key={1}
        maxWidth={false}
        disableGutters
        className={classes.container}
      >
        {isMdUp && <SideMenu views={views} />}
        <Container
          className={`scrollable ${classes.panelContainer}`}
          maxWidth={false}
          ref={ref}
        >
          <Switch color="secondary">
            {views.map(view => (
              <Route
                key={view.label}
                path={view.path}
                render={() => (
                  <view.component
                    containerRef={ref}
                    setShouldRefreshData={val =>
                      setShouldRefreshData(shouldRefreshDataSetter)
                    }
                  />
                )}
              />
            ))}
            {defaultView && (
              <Redirect key="default" push from="*" to={defaultView.path} />
            )}
          </Switch>
        </Container>
      </Container>
    </MissionDrawerContextProvider>
  ];
}

export default function Admin(props) {
  return (
    <LoadingScreenContextProvider>
      <AdminStoreProvider>
        <_Admin {...props} />
      </AdminStoreProvider>
    </LoadingScreenContextProvider>
  );
}
