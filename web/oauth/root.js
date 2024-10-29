import React from "react";
import Container from "@mui/material/Container";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { makeStyles } from "@mui/styles";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation,
  useHistory
} from "react-router-dom";
import { Header } from "../common/Header";
import { API_HOST, useApi } from "common/utils/api";
import { ConfirmUser } from "./ConfirmUser";
import { useLoadingScreen } from "common/utils/loading";
import { Consent } from "./Consent";
import Typography from "@mui/material/Typography";
import { captureSentryException } from "common/utils/sentry";

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
    withLoadingScreen(async () => {
      if (location.pathname === path) {
        try {
          const apiResponse = await fetch(
            `${API_HOST}/oauth/parse_authorization_request${location.search}`,
            { method: "POST" }
          );
          if (apiResponse.status !== 200) {
            setError("Les paramètres de la requête sont invalides");
          } else {
            const { client_name, redirect_uri } = await apiResponse.json();
            setClientName(client_name);
            setRedirectUri(redirect_uri);
            const isAuthenticated = await api.checkAuthentication();
            if (!isAuthenticated) {
              history.replace(
                `/login?next=${encodeURIComponent(
                  path +
                    "/consent" +
                    (location.search ? location.search + "&" : "?") +
                    `client_name=${client_name}`
                )}`,
                { clientName: client_name, redirectUri: redirect_uri }
              );
            } else {
              history.replace(path + "/confirm_user" + location.search);
            }
          }
        } catch (err) {
          captureSentryException(err);
          setError("Erreur lors de la connexion avec le serveur");
        }
      }
    });
  }, []);

  return error ? <Typography color="error">{error}</Typography> : null;
}

export default function OAuth() {
  const store = useStoreSyncedWithLocalStorage();
  const location = useLocation();

  const classes = useStyles();

  const path = useRouteMatch().path;

  const userId = store.userId();
  const [clientName, setClientName] = React.useState("");
  const [redirectUri, setRedirectUri] = React.useState("");

  React.useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const cName = qs.get("client_name");
    const rUri = qs.get("redirect_uri");
    if (cName) setClientName(cName);
    if (rUri) setRedirectUri(rUri);
  }, [location]);

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
          <Route path="*" render={() => <Redirect push to={`${path}`} />} />
        </Switch>
      </Container>
    </>
  );
}
