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
import { API_HOST, useApi } from "common/utils/api";
import { ConfirmUser } from "./ConfirmUser";
import { useLoadingScreen } from "common/utils/loading";
import { Consent } from "./Consent";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(4),
    margin: "auto",
    flexGrow: 1
  }
}));

function Authorize({ path, setClientName, setRedirectUri }) {
  const location = useLocation();
  const history = useHistory();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setTimeout(
      () =>
        withLoadingScreen(async () => {
          if (location.pathname == path) {
            try {
              const apiResponse = await fetch(
                `${API_HOST}/oauth/parse_authorization_request${location.search}`,
                { method: "GET" }
              );
              if (apiResponse.status !== 200) {
                setError("Les paramètres de la requête sont invalides");
              } else {
                const { client_name, redirect_uri } = await apiResponse.json();
                setClientName(client_name);
                setRedirectUri(redirect_uri);
                const isAuthenticated = await api.checkAuthentication();
                if (!isAuthenticated) {
                  history.push(
                    `/login?next=${encodeURIComponent(
                      path + "/consent" + location.search
                    )}`,
                    { clientName: client_name, redirectUri: redirect_uri }
                  );
                } else {
                  history.push(path + "/confirm_user" + location.search);
                }
              }
            } catch (err) {
              setError("Erreur lors de la connexion avec le serveur");
            }
          }
        }),
      500
    );
  }, []);

  return error ? <Typography color="error">{error}</Typography> : null;
}

export default function OAuth() {
  const store = useStoreSyncedWithLocalStorage();

  const classes = useStyles();

  const path = useRouteMatch().path;

  const userId = store.userId();
  const [clientName, setClientName] = React.useState("");
  const [redirectUri, setRedirectUri] = React.useState("");

  return (
    <>
      <Header disableMenu={true} />
      <Container className={classes.container} maxWidth="sm">
        <Switch>
          {userId && (
            <Route key="consent" path={`${path}/consent`}>
              <Consent clientName={clientName} redirectUri={redirectUri} />
            </Route>
          )}
          <Route key="confirm_user" path={`${path}/confirm_user`}>
            <ConfirmUser clientName={clientName} redirectUri={redirectUri} />
          </Route>
          <Route exact key="authorize" path={path}>
            <Authorize
              path={path}
              setClientName={setClientName}
              setRedirectUri={setRedirectUri}
            />
          </Route>
          <Redirect push key="default" from="*" to={`${path}`} />
        </Switch>
      </Container>
    </>
  );
}
