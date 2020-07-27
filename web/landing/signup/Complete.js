import React from "react";
import Typography from "@material-ui/core/Typography";
import { useHistory } from "react-router-dom";
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
  }
}));

export function Complete() {
  const classes = useStyles();

  const store = useStoreSyncedWithLocalStorage();

  const history = useHistory();

  return (
    <Paper>
      <Container style={{ padding: "32px" }} className="centered" maxWidth="sm">
        <Grid container spacing={10} direction="column" alignItems="center">
          <Grid item xs={12}>
            <Typography className={classes.title} variant="h1">
              🎉
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>L'inscription s'est terminée avec succès !</Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                store.clearIsSigningUp();
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
