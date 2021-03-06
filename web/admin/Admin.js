import React from "react";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation
} from "react-router-dom";
import Container from "@material-ui/core/Container";
import { ADMIN_VIEWS } from "./utils/navigation";
import "./assets/admin.scss";
import { loadCompaniesData } from "./utils/loadCompaniesData";
import { useApi } from "common/utils/api";
import { AdminStoreProvider, useAdminStore } from "./utils/store";
import {
  LoadingScreenContextProvider,
  useLoadingScreen
} from "common/utils/loading";

import { Header } from "../common/Header";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { SideMenu } from "./components/SideMenu";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { useSnackbarAlerts } from "../common/Snackbar";

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

function __Admin({ width }) {
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
              const companies = await loadCompaniesData(api, userId);
              adminStore.sync(companies);
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

  const defaultView = views.find(view => view.isDefault);
  return [
    <Header key={0} />,
    <Container
      key={1}
      maxWidth={false}
      disableGutters
      className={classes.container}
    >
      {isWidthUp("md", width) && <SideMenu views={views} />}
      <Container
        className={`scrollable ${classes.panelContainer}`}
        maxWidth={false}
        ref={ref}
      >
        <Switch>
          {views.map(view => (
            <Route
              key={view.label}
              path={view.path}
              render={() => (
                <view.component
                  containerRef={ref}
                  setShouldRefreshData={val =>
                    setShouldRefreshData({ value: val })
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
  ];
}

function _Admin(props) {
  return (
    <LoadingScreenContextProvider>
      <AdminStoreProvider>
        <__Admin {...props} />
      </AdminStoreProvider>
    </LoadingScreenContextProvider>
  );
}

const Admin = withWidth()(_Admin);

export default Admin;
