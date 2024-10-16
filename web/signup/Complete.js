import React from "react";
import Typography from "@mui/material/Typography";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Emoji from "../common/Emoji";
import AlertEmailDelay from "../common/AlertEmailDelay";
import ButtonGoHome from "../common/ButtonGoHome";
import { usePageTitle } from "../common/UsePageTitle";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    textAlign: "center",
    fontSize: "300%"
  },
  container: {
    padding: theme.spacing(4)
  },
  grid: {
    marginBottom: 0
  }
}));

const getCompaniesText = companiesName => {
  if (!companiesName) {
    return "L'entreprise a été créée avec succès !";
  }

  if (companiesName.length === 1) {
    return `L'entreprise ${companiesName[0]} a été créée avec succès !`;
  }

  return `Les entreprises ${companiesName.join(
    ", "
  )} ont été créées avec succès !`;
};

export function Complete({ type }) {
  usePageTitle("Inscription - Mobilic");
  const classes = useStyles();

  const store = useStoreSyncedWithLocalStorage();

  const location = useLocation();

  const companiesName = location.state ? location.state.companiesName : null;

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
            <Emoji emoji="🎉" ariaLabel="Succès" />
          </Typography>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: "center" }}>
          {type === "user" ? (
            <Typography>L'inscription s'est terminée avec succès !</Typography>
          ) : (
            <Typography>{getCompaniesText(companiesName)}</Typography>
          )}
          {type === "user" && (
            <Typography>
              Un email de vérification de votre compte vous a été envoyé à
              l'adresse <strong>{store.userInfo().email}</strong>.
            </Typography>
          )}
          {type === "user" && <AlertEmailDelay />}
        </Grid>
        <Grid item xs={12}>
          <ButtonGoHome />
        </Grid>
      </Grid>
    </Container>
  );
}
