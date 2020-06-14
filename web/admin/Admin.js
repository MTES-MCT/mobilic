import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { SideMenu } from "./components/SideMenu";
import { ADMIN_VIEWS } from "./utils/navigation";
import "./assets/admin.scss";
import Box from "@material-ui/core/Box";
import { loadCompanyData } from "./utils/loadCompanyData";
import { useApi } from "common/utils/api";
import { AdminStoreProvider, useAdminStore } from "./utils/store";
import { UserHeader } from "../common/UserHeader";
import { useLoadingScreen } from "common/utils/loading";

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

  async function loadData(companyId) {
    try {
      const company = await loadCompanyData(api, companyId);
      adminStore.sync(company);
    } catch (err) {
      console.log(err);
    }
  }

  React.useEffect(() => {
    if (adminStore.companyId && adminStore.userId) {
      withLoadingScreen(() => loadData(adminStore.companyId));
    }
  }, [adminStore.companyId, adminStore.userId]);

  const defaultView = views.find(view => view.isDefault);
  return [
    <UserHeader key={0} />,
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
    <AdminStoreProvider>
      <_Admin {...props} />
    </AdminStoreProvider>
  );
}
