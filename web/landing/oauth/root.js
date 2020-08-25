import React from "react";
import Container from "@material-ui/core/Container";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation,
  useHistory
} from "react-router-dom";
import { Header } from "../../common/Header";
import { useApi } from "common/utils/api";
import { ConfirmUser } from "./ConfirmUser";
import { useLoadingScreen } from "common/utils/loading";
import { Consent } from "./Consent";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    margin: "auto",
    flexGrow: 1
  }
}));

function Authorize({ path }) {
  const location = useLocation();
  const history = useHistory();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  React.useEffect(() => {
    setTimeout(
      () =>
        withLoadingScreen(async () => {
          if (location.pathname === path) {
            const isAuthenticated = await api.checkAuthentication();
            if (!isAuthenticated) {
              history.push(
                `/login?next=${encodeURIComponent(
                  path + "/consent" + location.search
                )}`
              );
            } else {
              history.push(path + "/confirm_user" + location.search);
            }
          }
        }),
      500
    );
  }, []);

  return null;
}

export default function OAuth() {
  const store = useStoreSyncedWithLocalStorage();

  const classes = useStyles();

  const path = useRouteMatch().path;

  const userId = store.userId();

  return (
    <>
      <Header disableMenu={true} />
      <Container className={classes.container} maxWidth="sm">
        <Switch>
          {userId && (
            <Route key="consent" path={`${path}/consent`}>
              <Consent />
            </Route>
          )}
          {userId && (
            <Route key="confirm_user" path={`${path}/confirm_user`}>
              <ConfirmUser />
            </Route>
          )}
          <Route exact key="authorize" path={path}>
            <Authorize path={path} />
          </Route>
          <Redirect push key="default" from="*" to={`${path}`} />
        </Switch>
      </Container>
    </>
  );
}
