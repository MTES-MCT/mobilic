import React from "react";

import { useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useApi } from "common/utils/api";
import { Header } from "../common/Header";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useLoadingScreen } from "common/utils/loading";
import { formatPersonName } from "common/utils/coworkers";
import Grid from "@material-ui/core/Grid";
import { loadEmployeeInvite } from "../common/loadEmployeeInvite";
import { LinkButton } from "../common/LinkButton";

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
  const location = useLocation();
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  const [error, setError] = React.useState("");
  const classes = useStyles();

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const token = queryString.get("token");

    if (token) {
      api.logout();
      withLoadingScreen(() => loadEmployeeInvite(token, store, api, setError));
    } else setError("Jeton d'invitation manquant");
  }, [location]);

  const employeeInvite = store.employeeInvite();

  return [
    <Header key={1} />,
    <Container className={classes.container} key={2} maxWidth="md">
      <Paper>
        <Container className={classes.innerContainer} maxWidth="sm">
          {error || !employeeInvite
            ? [
                <Typography key={0} color="error">
                  Impossible d'accéder à la page pour la raison suivante :
                </Typography>,
                <Typography key={1} color="error">
                  {error}
                </Typography>
              ]
            : [
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
                  justify="space-evenly"
                  spacing={2}
                >
                  <Grid item>
                    <LinkButton
                      color="primary"
                      variant="contained"
                      href={`/signup/user?token=${employeeInvite.inviteToken}`}
                    >
                      Je crée un compte
                    </LinkButton>
                  </Grid>
                  <Grid item>
                    <LinkButton
                      color="primary"
                      variant="outlined"
                      href={`/login?next=${encodeURI(
                        "/redeem_invite?token=" + employeeInvite.inviteToken
                      )}`}
                    >
                      J'ai déjà un compte
                    </LinkButton>
                  </Grid>
                </Grid>
              ]}
        </Container>
      </Paper>
    </Container>
  ];
}
