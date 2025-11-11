import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import React from "react";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { makeStyles } from "@mui/styles";
import Emoji from "../../common/Emoji";
import Notice from "../../common/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { RESEND_ACTIVATION_EMAIL } from "common/utils/apiQueries/loginSignup";

export default function AlertEmailNotActivated({ email }) {
  const useStyles = makeStyles((theme) => ({
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
    <Notice
      type="error"
      sx={{ marginTop: 2 }}
      title="Adresse email non activée"
      description={
        <>
          <Typography>
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
                data-testid="resendActivationEmailButton"
                onClick={resendActivationEmail}
              >
                Renvoyer l'email d'activation
              </Button>
            </ListItem>
          </List>
        </>
      }
    />
  );
}
