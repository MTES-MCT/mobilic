import React from "react";

import { useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import { Header } from "../common/Header";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useLoadingScreen } from "common/utils/loading";
import { formatPersonName } from "common/utils/coworkers";
import Grid from "@mui/material/Grid";
import { loadEmployeeInvite } from "../common/loadEmployeeInvite";
import { LinkButton } from "../common/LinkButton";
import { usePageTitle } from "../common/UsePageTitle";
import { Main } from "../common/semantics/Main";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    margin: "auto",
    flexGrow: 1
  },
  innerContainer: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8)
  },
  text: {
    paddingBottom: theme.spacing(4)
  },
  buttonContainer: {
    padding: theme.spacing(2)
  }
}));

export function Invite() {
  usePageTitle("Invitation - Mobilic");
  const location = useLocation();
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  const [error, setError] = React.useState("");
  const classes = useStyles();

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const token = queryString.get("token");

    async function onMount() {
      if (token) {
        withLoadingScreen(async () => {
          await api.logout({
            postFCLogoutRedirect: `/logout?next=${encodeURIComponent(
              "/invite?token=" + token
            )}`
          });
          loadEmployeeInvite(token, store, api, setError);
        });
      } else setError("lien d'invitation manquant");
    }
    onMount();
  }, [location]);

  const employeeInvite = store.employeeInvite();

  return (
    <>
      <Header />
      <Main maxWidth="lg" className={classes.container}>
        <Paper>
          <Container className={classes.innerContainer} maxWidth="sm">
            {!employeeInvite || error ? (
              error ? (
                <Typography key={0} color="error">
                  Impossible d'accéder à la page pour la raison suivante :{" "}
                  {error}
                </Typography>
              ) : null
            ) : (
              [
                <Typography className={classes.text} key={1}>
                  <span className="bold">
                    {formatPersonName(employeeInvite.submitter)}
                  </span>{" "}
                  vous invite à rejoindre l'entreprise{" "}
                  <span className="bold">{employeeInvite.company.name}</span>.
                </Typography>,
                <Grid
                  key={2}
                  className={classes.buttonContainer}
                  container
                  justifyContent="space-evenly"
                  spacing={2}
                >
                  <Grid item>
                    <LinkButton
                      aria-label="Inscription"
                      priority="primary"
                      to={`/signup/user?token=${employeeInvite.inviteToken}`}
                    >
                      Je crée un compte
                    </LinkButton>
                  </Grid>
                  <Grid item>
                    <LinkButton
                      aria-label="Rattachement d'un compte existant"
                      priority="secondary"
                      to={`/login?next=${encodeURIComponent(
                        "/redeem_invite?token=" + employeeInvite.inviteToken
                      )}`}
                    >
                      J'ai déjà un compte
                    </LinkButton>
                  </Grid>
                </Grid>
              ]
            )}
          </Container>
        </Paper>
      </Main>
    </>
  );
}
