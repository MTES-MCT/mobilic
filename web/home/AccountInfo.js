import React from "react";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { formatPersonName } from "common/utils/coworkers";
import { Header } from "../common/Header";
import { Section } from "../common/Section";
import Grid from "@material-ui/core/Grid";
import { InfoItem } from "./InfoField";
import Alert from "@material-ui/lab/Alert";
import { useApi } from "common/utils/api";
import { useModals } from "common/utils/modals";
import Divider from "@material-ui/core/Divider";
import AlertTitle from "@material-ui/lab/AlertTitle";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { frenchFormatDateStringOrTimeStamp } from "common/utils/time";
import {
  CHANGE_EMAIL_MUTATION,
  RESEND_ACTIVATION_EMAIL
} from "common/utils/apiQueries";
import { EmploymentInfoCard } from "../common/EmploymentInfoCard";
import { employmentSelector } from "common/store/selectors";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { useSnackbarAlerts } from "../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import List from "@material-ui/core/List";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  innerContainer: {
    paddingBottom: theme.spacing(6)
  },
  inactiveAlert: {
    marginTop: theme.spacing(2)
  },
  activationIntroLabel: {
    paddingBottom: theme.spacing(2)
  },
  actionButton: {
    marginTop: theme.spacing(2)
  },
  emailCheckIcon: {
    color: "rgb(85, 21, 15)",
    minWidth: theme.spacing(5)
  },
  emailCheckItem: {
    alignItems: "baseline"
  }
}));

function NoEmploymentAlert() {
  return (
    <Alert severity="warning">
      Vous n'avez aucune entreprise à laquelle vous êtes rattaché(e) et{" "}
      <span className="bold">
        vous ne pouvez donc pas enregistrer de temps de travail
      </span>
      . Rapprochez-vous de votre employeur du moment pour effectuer le
      rattachement.
    </Alert>
  );
}

export default function Home() {
  const classes = useStyles();

  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const employments = employmentSelector(store.state);
  const alerts = useSnackbarAlerts();
  const modals = useModals();

  const userInfo = store.userInfo();
  const isActive = userInfo.hasActivatedEmail;

  async function resendActivationEmail() {
    try {
      await api.graphQlMutate(
        RESEND_ACTIVATION_EMAIL,
        { email: userInfo.email },
        { context: { nonPublicApi: true } }
      );
      alerts.success("Le mail a été renvoyé avec succès", userInfo.email, 6000);
    } catch (err) {
      alerts.error(formatApiError(err), userInfo.email, 6000);
    }
  }

  return [
    <Header key={0} />,
    <PaperContainer key={1} style={{ textAlign: "left" }}>
      <Container className={`centered ${classes.innerContainer}`} maxWidth="sm">
        <PaperContainerTitle>Mes informations</PaperContainerTitle>
        <Section title="Moi">
          <Grid container wrap="wrap" spacing={4}>
            <Grid item xs={12}>
              <InfoItem
                name="Identifiant Mobilic"
                value={userInfo.id}
                bold
                info={
                  employments.length === 0
                    ? "Cet identifiant est à communiquer à votre employeur afin qu'il vous rattache à l'entreprise"
                    : ""
                }
              />
            </Grid>
            <Grid item sm={6} zeroMinWidth>
              <InfoItem name="Nom" value={formatPersonName(userInfo)} />
            </Grid>
            {userInfo.birthDate && (
              <Grid item sm={6} zeroMinWidth>
                <InfoItem
                  name="Date de naissance"
                  value={frenchFormatDateStringOrTimeStamp(userInfo.birthDate)}
                />
              </Grid>
            )}
            <Grid item {...(isActive ? { sm: 6 } : { xs: 12 })} zeroMinWidth>
              <InfoItem
                data-qa="emailInfoItem"
                name="Email"
                value={userInfo.email}
                actionTitle="Modifier email"
                action={() =>
                  modals.open("changeEmail", {
                    handleSubmit: async email => {
                      const apiResponse = await api.graphQlMutate(
                        CHANGE_EMAIL_MUTATION,
                        { email },
                        { context: { nonPublicApi: true } }
                      );
                      await store.setUserInfo({
                        ...store.userInfo(),
                        ...apiResponse.data.account.changeEmail
                      });
                      await broadCastChannel.postMessage("update");
                    }
                  })
                }
                alertComponent={
                  isActive ? null : (
                    <Alert
                      key={0}
                      severity="error"
                      className={classes.inactiveAlert}
                    >
                      <AlertTitle className="bold">
                        Adresse email non activée
                      </AlertTitle>
                      <Typography className={classes.activationIntroLabel}>
                        Un email d'activation vous a été envoyé à l'adresse
                        ci-dessus. L'activation est nécessaire pour accéder aux
                        services Mobilic.
                      </Typography>
                      <List disablePadding>
                        <ListItem
                          disableGutters
                          dense
                          className={classes.emailCheckItem}
                        >
                          <ListItemIcon className={classes.emailCheckIcon}>
                            👉
                          </ListItemIcon>
                          <ListItemText primary="Il peut mettre quelques minutes à arriver, merci pour votre patience" />
                        </ListItem>
                        <ListItem
                          disableGutters
                          dense
                          className={classes.emailCheckItem}
                        >
                          <ListItemIcon className={classes.emailCheckIcon}>
                            👉
                          </ListItemIcon>
                          <ListItemText primary="Merci de vérifier vos spams" />
                        </ListItem>
                        <ListItem
                          disableGutters
                          dense
                          className={classes.emailCheckItem}
                        >
                          <ListItemIcon className={classes.emailCheckIcon}>
                            👉
                          </ListItemIcon>
                          <ListItemText primary="Pour recevoir nos emails sans encombres, vous pouvez ajouter mobilic@beta.gouv.fr à votre liste de contacts" />
                        </ListItem>
                        <ListItem
                          disableGutters
                          dense
                          className={classes.emailCheckItem}
                        >
                          <ListItemIcon className={classes.emailCheckIcon}>
                            👉
                          </ListItemIcon>
                          <ListItemText primary="Si vous n'avez pas reçu l'email de confirmation au bout d'une demi-heure, vous pouvez le renvoyer en cliquant sur le bouton ci dessous :" />
                        </ListItem>
                        <ListItem
                          disableGutters
                          dense
                          className={classes.emailCheckItem}
                        >
                          <ListItemIcon className={classes.emailCheckIcon} />
                          <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            data-qa="resendActivationEmailButton"
                            onClick={resendActivationEmail}
                          >
                            Renvoyer l'email d'activation
                          </Button>
                        </ListItem>
                      </List>
                    </Alert>
                  )
                }
              />
            </Grid>
          </Grid>
        </Section>
        {isActive && <Divider />}
        {isActive && (
          <Section
            title={
              employments.length > 1 ? "Mes entreprises" : "Mon entreprise"
            }
          >
            {employments.length > 0 ? (
              <Grid container spacing={2} direction="column">
                {employments.map(e => (
                  <Grid item xs={12} key={e.id}>
                    <EmploymentInfoCard
                      employment={e}
                      key={e.id}
                      defaultOpen={
                        employments.length === 1 || !e.isAcknowledged
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <NoEmploymentAlert />
            )}
          </Section>
        )}
      </Container>
    </PaperContainer>
  ];
}
