import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles(theme => ({
  header: {
    backgroundColor: ({ staging }) =>
      staging ? theme.palette.warning.main : theme.palette.success.main,
    textAlign: "justify",
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    flexShrink: 0
  },
  links: {
    display: "flex"
  },
  inner: {
    flexGrow: 1
  },
  closeButton: {
    padding: 0,
    paddingTop: 2
  }
}));

export function EnvironmentHeader() {
  const [open, setOpen] = React.useState(true);

  const staging = process.env.REACT_APP_SENTRY_ENVIRONMENT === "staging";

  const classes = useStyles({ staging });

  if (!open) return null;

  return (
    <Box py={1} px={2} className={classes.header}>
      <Box className={classes.inner}>
        {staging && (
          <Typography>
            Vous êtes sur l'environnement de recette Mobilic, utilisé uniquement
            en interne pour tester les nouvelles fonctionnalités. Le bon
            fonctionnement du service <strong>n'est pas garanti</strong>.
          </Typography>
        )}
        {!staging && (
          <Typography>
            Vous êtes sur l'environnement "bac à sable" Mobilic, qui sert de
            démo du service.
          </Typography>
        )}
        <Box className={classes.links}>
          <Link
            variant="body1"
            href="https://mobilic.beta.gouv.fr"
            style={{ marginRight: 16 }}
          >
            Lien vers Mobilic
          </Link>
          {staging && (
            <Link variant="body1" href="https://sandbox.mobilic.beta.gouv.fr">
              Lien vers le bac à sable
            </Link>
          )}
          {!staging && (
            <Link variant="body1" href="https://staging.mobilic.beta.gouv.fr">
              Lien vers la recette
            </Link>
          )}
        </Box>
      </Box>
      <IconButton className={classes.closeButton}>
        <CloseIcon onClick={() => setOpen(false)} />
      </IconButton>
    </Box>
  );
}
