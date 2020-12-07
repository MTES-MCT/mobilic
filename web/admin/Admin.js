import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
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
import * as Sentry from "@sentry/browser";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { SideMenu } from "./components/SideMenu";
import { isWidthUp } from "@material-ui/core";
import withWidth from "@material-ui/core/withWidth";

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

  const classes = useStyles();

  const views = ADMIN_VIEWS.map(view => {
    const absPath = `${path}${view.path}`;
    return {
      ...view,
      path: absPath
    };
  });

  async function loadData(userId) {
    try {
      const companies = await loadCompaniesData(api, userId);
      adminStore.sync(companies);
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
    }
  }

  React.useEffect(() => {
    if (adminStore.userId) {
      withLoadingScreen(async () => await loadData(adminStore.userId));
    }
  }, [adminStore.userId]);

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
            <Route key={view.label} path={view.path}>
              {view.component({ containerRef: ref })}
            </Route>
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

export const Admin = withWidth()(_Admin);
