import React from "react";
import Typography from "@material-ui/core/Typography";
import { useApi } from "common/utils/api";
import { useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { Section } from "../../common/Section";
import { LoadingButton } from "common/components/LoadingButton";
import Grid from "@material-ui/core/Grid";

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

  const [error, setError] = React.useState("");

  async function handleAuthorize(deny = false) {
    const apiResponse = await api.httpQuery(
      "GET",
      `/oauth/authorize${location.search}${deny ? "&deny=true" : ""}`
    );
    if (apiResponse.status === 400) {
      setError("La demande d'autorisation est invalide");
    } else if (apiResponse.status !== 200) {
      setError("Erreur dans le traitement de la requête d'autorisation");
    } else {
      const json = await apiResponse.json();
      window.location.href = json.uri;
    }
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (
    (clientName || location.state.clientName) &&
    (redirectUri || location.state.redirectUri)
  ) {
    return (
      <Paper key={1}>
        <Container className="centered" maxWidth="xs">
          <Typography className={classes.title} variant="h3">
            {clientName || location.state.clientName} souhaite accéder à votre
            compte Mobilic
          </Typography>
          <Typography>{store.userInfo().email}</Typography>
          <Section last>
            <Grid className="centered" container spacing={4} justify="center">
              <Grid item>
                <LoadingButton
                  color="primary"
                  variant="contained"
                  onClick={() => handleAuthorize(false)}
                >
                  Autoriser
                </LoadingButton>
              </Grid>
              <Grid item>
                <LoadingButton
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
              {decodeURIComponent(redirectUri || location.state.redirectUri)}
            </Typography>
          </Section>
        </Container>
      </Paper>
    );
  }

  return null;
}
