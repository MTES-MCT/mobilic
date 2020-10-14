import React from "react";
import Typography from "@material-ui/core/Typography";
import { useHistory, useLocation } from "react-router-dom";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    textAlign: "center",
    fontSize: "300%"
  },
  container: {
    padding: theme.spacing(4)
  }
}));

export function Complete({ type }) {
  const classes = useStyles();

  const store = useStoreSyncedWithLocalStorage();

  const history = useHistory();
  const location = useLocation();

  const companyName = location.state ? location.state.companyName : null;

  return (
    <Paper>
      <Container className={`centered ${classes.container}`} maxWidth="sm">
        <Grid container spacing={10} direction="column" alignItems="center">
          <Grid item xs={12}>
            <Typography className={classes.title} variant="h1">
              🎉
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {type === "user" ? (
              <Typography>
                L'inscription s'est terminée avec succès !
              </Typography>
            ) : (
              <Typography>
                L'entreprise{" "}
                {companyName ? <strong>{companyName} </strong> : ""}a été créée
                avec succès !
              </Typography>
            )}
            {type === "user" && (
              <Typography>
                Un email d'activation de votre compte vous a été envoyé à
                l'adresse <strong>{store.userInfo().email}</strong>.
              </Typography>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                history.push("/");
              }}
            >
              Aller dans mon espace
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
}
