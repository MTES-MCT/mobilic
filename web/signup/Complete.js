import React from "react";
import Typography from "@mui/material/Typography";
import { useHistory, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Alert from "@mui/material/Alert";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    textAlign: "center",
    fontSize: "300%"
  },
  alert: {
    textAlign: "left",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  container: {
    padding: theme.spacing(4)
  },
  grid: {
    marginBottom: 0
  }
}));

export function Complete({ type }) {
  const classes = useStyles();

  const store = useStoreSyncedWithLocalStorage();

  const history = useHistory();
  const location = useLocation();

  const companyName = location.state ? location.state.companyName : null;

  return (
    <Container className={`centered ${classes.container}`} maxWidth="sm">
      <Grid
        container
        spacing={8}
        direction="column"
        alignItems="center"
        className={classes.grid}
      >
        <Grid item xs={12}>
          <Typography className={classes.title} variant="h1">
            🎉
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {type === "user" ? (
            <Typography>L'inscription s'est terminée avec succès !</Typography>
          ) : (
            <Typography>
              L'entreprise {companyName ? <strong>{companyName} </strong> : ""}a
              été créée avec succès !
            </Typography>
          )}
          {type === "user" && (
            <Typography>
              Un email de vérification de votre compte vous a été envoyé à
              l'adresse <strong>{store.userInfo().email}</strong>.
            </Typography>
          )}
          {type === "user" && (
            <Alert severity="warning" className={classes.alert}>
              <Typography>Il est possible que</Typography>
              <ul style={{ padding: 0 }}>
                <li>
                  <Typography>
                    l'email parvienne avec un léger délai, de l'ordre de
                    quelques minutes normalement.
                  </Typography>
                </li>
                <li>
                  <Typography>
                    l'email atterrisse dans votre courrier indésirable (spams).
                  </Typography>
                </li>
              </ul>
            </Alert>
          )}
        </Grid>
        <Grid item xs={12}>
          <Button
            aria-label="Aller dans mon espace"
            color="primary"
            variant="contained"
            onClick={() => {
              history.push("/home");
            }}
          >
            Aller dans mon espace
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
