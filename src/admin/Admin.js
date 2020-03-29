import React from "react";
import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";
import Container from "@material-ui/core/Container";
import { UserHeader } from "../common/components/UserHeader";
import { SideMenu } from "./components/SideMenu";
import { ADMIN_VIEWS } from "./utils/navigation";
import "./assets/admin.scss";
import Box from "@material-ui/core/Box";

export function Admin() {
  const { path } = useRouteMatch();

  const views = ADMIN_VIEWS.map(view => {
    const absPath = `${path}${view.route}`;
    return {
      ...view,
      route: absPath
    };
  });

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
      <Box my={2} className="panel-container scrollable">
        <Container>
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
        </Container>
      </Box>
    </Container>
  ];
}
