import React from "react";
import Typography from "@material-ui/core/Typography";
import { useApi } from "common/utils/api";
import { useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { Section } from "../common/Section";
import { LoadingButton } from "common/components/LoadingButton";
import Grid from "@material-ui/core/Grid";
import { HTTP_QUERIES } from "common/utils/apiQueries";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    textAlign: "center"
  },
  redirection: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(1),
    fontStyle: "italic"
  }
}));

export function Consent({ clientName, redirectUri }) {
  const classes = useStyles();

  const api = useApi();
  const location = useLocation();
  const store = useStoreSyncedWithLocalStorage();

  const queryString = new URLSearchParams(location.search);
  const actualClientName =
    clientName ||
    (location.state
      ? location.state.clientName
      : queryString.get("client_name"));
  const actualRedirectUri =
    redirectUri ||
    (location.state
      ? location.state.redirectUri
      : queryString.get("redirect_uri"));

  const [error, setError] = React.useState("");

  async function handleAuthorize(deny = false) {
    try {
      const apiResponse = await api.httpQuery(HTTP_QUERIES.oauthAuthorize, {
        search: `${location.search}${deny ? "&deny=true" : ""}`
      });
      const json = await apiResponse.json();
      window.location.href = json.uri;
    } catch (err) {
      if (
        err.name === "WrongStatusError" &&
        err.response &&
        err.response.status === 400
      )
        setError("La demande d'autorisation est invalide");
      else setError("Erreur dans le traitement de la requête d'autorisation");
    }
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (actualClientName && actualRedirectUri) {
    return (
      <Paper key={1}>
        <Container className="centered" maxWidth="xs">
          <Typography className={classes.title} variant="h3">
            {actualClientName} souhaite accéder à votre compte Mobilic
          </Typography>
          <Typography>{store.userInfo().email}</Typography>
          <Section last>
            <Grid className="centered" container spacing={4} justify="center">
              <Grid item>
                <LoadingButton
                  aria-label="Autoriser"
                  color="primary"
                  variant="contained"
                  onClick={() => handleAuthorize(false)}
                >
                  Autoriser
                </LoadingButton>
              </Grid>
              <Grid item>
                <LoadingButton
                  aria-label="Refuser"
                  color="primary"
                  variant="outlined"
                  onClick={async () => await handleAuthorize(true)}
                >
                  Refuser
                </LoadingButton>
              </Grid>
            </Grid>
            <Typography className={classes.redirection}>
              L'autorisation vous redirigera vers l'URL{" "}
              {decodeURIComponent(actualRedirectUri)}
            </Typography>
          </Section>
        </Container>
      </Paper>
    );
  }

  return null;
}
