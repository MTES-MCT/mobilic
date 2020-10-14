import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { SideMenu } from "./components/SideMenu";
import { ADMIN_VIEWS } from "./utils/navigation";
import "./assets/admin.scss";
import Box from "@material-ui/core/Box";
import { loadCompaniesData } from "./utils/loadCompaniesData";
import { useApi } from "common/utils/api";
import { AdminStoreProvider, useAdminStore } from "./utils/store";
import {
  LoadingScreenContextProvider,
  useLoadingScreen
} from "common/utils/loading";
import { Header } from "../common/Header";
import * as Sentry from "@sentry/browser";

function _Admin() {
  const api = useApi();
  const adminStore = useAdminStore();
  const withLoadingScreen = useLoadingScreen();
  const { path } = useRouteMatch();

  const views = ADMIN_VIEWS.map(view => {
    const absPath = `${path}${view.route}`;
    return {
      ...view,
      route: absPath
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

  const defaultView = views.find(view => view.isDefault);
  return [
    <Header key={0} />,
    <Container
      key={1}
      className="flex-row-stretch no-margin-no-padding"
      style={{ height: "100%", overflowY: "hidden" }}
      maxWidth={false}
    >
      <SideMenu views={views} />
      <Box my={2} px={2} className="panel-container scrollable">
        <Switch>
          {views.map(view => (
            <Route key={view.label} path={view.route}>
              {view.component}
            </Route>
          ))}
          {defaultView && (
            <Redirect key="default" push from="*" to={defaultView.route} />
          )}
        </Switch>
      </Box>
    </Container>
  ];
}

export function Admin(props) {
  return (
    <LoadingScreenContextProvider>
      <AdminStoreProvider>
        <_Admin {...props} />
      </AdminStoreProvider>
    </LoadingScreenContextProvider>
  );
}
