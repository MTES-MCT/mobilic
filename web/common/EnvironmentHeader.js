import React from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";
import { makeStyles } from "@mui/styles";
import Link from "@mui/material/Link";

const useStyles = makeStyles(theme => ({
  header: {
    width: "100%",
    textAlign: "left",
    position: "sticky",
    top: "0",
    zIndex: "1100" // needs to be > 1000 (activity switch) and < 1200 (close menu button)
  }
}));

export function EnvironmentHeader() {
  const staging = process.env.REACT_APP_SENTRY_ENVIRONMENT === "staging";

  const classes = useStyles({ staging });

  return (
    <Alert severity={staging ? "warning" : "error"} className={classes.header}>
      <AlertTitle>
        {staging
          ? "Vous êtes sur l'environnement de recette Mobilic, utilisé uniquement en interne pour tester les nouvelles fonctionnalités. Le bon fonctionnement du service n'est pas garanti."
          : 'Vous êtes sur l\'environnement "bac à sable" Mobilic, qui sert de démo du service.'}
      </AlertTitle>
      <Stack direction={{ xs: "column", sm: "row" }}>
        <Link
          variant="body1"
          href="https://mobilic.beta.gouv.fr"
          target="_blank"
          rel="noopener"
          style={{ marginRight: 16 }}
        >
          Lien vers Mobilic
        </Link>
        {staging && (
          <Link
            variant="body1"
            href="https://sandbox.mobilic.beta.gouv.fr"
            target="_blank"
            rel="noopener"
          >
            Lien vers le bac à sable
          </Link>
        )}
      </Stack>
    </Alert>
  );
}
