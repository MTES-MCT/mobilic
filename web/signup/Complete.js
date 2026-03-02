import React from "react";
import Typography from "@mui/material/Typography";
import { useLocation } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Emoji from "../common/Emoji";
import AlertEmailDelay from "../common/AlertEmailDelay";
import ButtonGoHome from "../common/ButtonGoHome";
import { usePageTitle } from "../common/UsePageTitle";
import { Stack } from "@mui/material";
import { WebinarList } from "../landing/components/WebinarList";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
    fontSize: "300%"
  },
  container: {
    padding: theme.spacing(4)
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
  const userHasActivatedEmail = store.userInfo().hasActivatedEmail ?? false;
  
  return (
    <Container className={`centered ${classes.container}`} maxWidth="md">
      <Stack rowGap={2}>
        <Typography className={classes.title} variant="h1">
          <Emoji emoji="🎉" ariaLabel="Succès" />
        </Typography>
        {type === "user" ? (
          <Typography>
            L'inscription s'est terminée avec succès ! 
            { 
              !userHasActivatedEmail && (
                <>
                  {" "}
                  Un email de vérification
                  de votre compte vous a été envoyé à l'adresse{" "}
                  <strong>{store.userInfo().email}</strong>
                </>
              )
            }
          </Typography>
        ) : (
          <Typography>{getCompaniesText(companiesName)}</Typography>
        )}
        {type === "user" && !userHasActivatedEmail && <AlertEmailDelay />}
        <Typography fontWeight="700" fontSize="1.25rem" mt={2}>
          Offrez-vous une formation gratuite de 45 minutes !
        </Typography>
        <Typography>
          <b>Apprenez à maîtriser Mobilic</b> grâce à un accompagnement
          personnalisé et <b>gagnez du temps</b>&nbsp;: formation à la mise en
          place, démonstration et réponse à toutes vos questions !
        </Typography>
        <WebinarList setCantDisplayWebinarsBecauseNoneOrError={() => {}} />
        <ButtonGoHome />
      </Stack>
    </Container>
  );
}
