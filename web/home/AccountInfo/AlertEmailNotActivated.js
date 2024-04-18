import AlertTitle from "@mui/material/AlertTitle";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import React from "react";
import { RESEND_ACTIVATION_EMAIL } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { makeStyles } from "@mui/styles";
import Emoji from "../../common/Emoji";

export default function AlertEmailNotActivated({ email }) {
  const useStyles = makeStyles(theme => ({
    inactiveAlert: {
      marginTop: theme.spacing(2)
    },
    activationIntroLabel: {
      paddingBottom: theme.spacing(2)
    },
    emailCheckIcon: {
      color: "rgb(85, 21, 15)",
      minWidth: theme.spacing(5)
    },
    emailCheckItem: {
      alignItems: "baseline"
    }
  }));

  const api = useApi();
  const alerts = useSnackbarAlerts();
  const classes = useStyles();

  async function resendActivationEmail() {
    try {
      await api.graphQlMutate(
        RESEND_ACTIVATION_EMAIL,
        { email: email },
        { context: { nonPublicApi: true } }
      );
      alerts.success("Le mail a été renvoyé avec succès", email, 6000);
    } catch (err) {
      alerts.error(formatApiError(err), email, 6000);
    }
  }

  return (
    <Alert key={0} severity="error" className={classes.inactiveAlert}>
      <AlertTitle className="bold">Adresse email non activée</AlertTitle>
      <Typography className={classes.activationIntroLabel}>
        Un email d'activation vous a été envoyé à l'adresse ci-dessus.
        L'activation est nécessaire pour accéder aux services Mobilic.
      </Typography>
      <List disablePadding>
        <ListItem disableGutters dense className={classes.emailCheckItem}>
          <ListItemIcon className={classes.emailCheckIcon}>
            <Emoji emoji="👉" ariaLabel="Information" />
          </ListItemIcon>
          <ListItemText primary="Il peut mettre quelques minutes à arriver, merci pour votre patience" />
        </ListItem>
        <ListItem disableGutters dense className={classes.emailCheckItem}>
          <ListItemIcon className={classes.emailCheckIcon}>
            <Emoji emoji="👉" ariaLabel="Information" />
          </ListItemIcon>
          <ListItemText primary="Merci de vérifier vos spams" />
        </ListItem>
        <ListItem disableGutters dense className={classes.emailCheckItem}>
          <ListItemIcon className={classes.emailCheckIcon}>
            <Emoji emoji="👉" ariaLabel="Information" />
          </ListItemIcon>
          <ListItemText primary="Pour recevoir nos emails sans encombre, vous pouvez ajouter nepasrepondre@mobilic.beta.gouv.fr à votre liste de contacts" />
        </ListItem>
        <ListItem disableGutters dense className={classes.emailCheckItem}>
          <ListItemIcon className={classes.emailCheckIcon}>
            <Emoji emoji="👉" ariaLabel="Information" />
          </ListItemIcon>
          <ListItemText primary="Si vous n'avez pas reçu l'email de confirmation au bout d'une demi-heure, vous pouvez le renvoyer en cliquant sur le bouton ci dessous :" />
        </ListItem>
        <ListItem disableGutters dense className={classes.emailCheckItem}>
          <ListItemIcon className={classes.emailCheckIcon} />
          <Button
            size="small"
            color="primary"
            variant="contained"
            data-testid="resendActivationEmailButton"
            onClick={resendActivationEmail}
          >
            Renvoyer l'email d'activation
          </Button>
        </ListItem>
      </List>
    </Alert>
  );
}
