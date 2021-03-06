import React from "react";
import Typography from "@material-ui/core/Typography";
import {
  useStoreSyncedWithLocalStorage,
  broadCastChannel
} from "common/utils/store";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { formatPersonName } from "common/utils/coworkers";
import { Header } from "../common/Header";
import { Section } from "../common/Section";
import Grid from "@material-ui/core/Grid";
import { InfoItem } from "./InfoField";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Alert from "@material-ui/lab/Alert";
import { LoadingButton } from "common/components/LoadingButton";
import { useApi } from "common/utils/api";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import { useModals } from "common/utils/modals";
import Divider from "@material-ui/core/Divider";
import AlertTitle from "@material-ui/lab/AlertTitle";
import Box from "@material-ui/core/Box";
import { useSnackbarAlerts } from "../common/Snackbar";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { frenchFormatDateString } from "common/utils/time";
import {
  CHANGE_EMAIL_MUTATION,
  REJECT_EMPLOYMENT_MUTATION,
  VALIDATE_EMPLOYMENT_MUTATION
} from "common/utils/apiQueries";

const useStyles = makeStyles(theme => ({
  sectionTitle: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  innerContainer: {
    paddingBottom: theme.spacing(6)
  },
  employmentStatus: {
    color: isAcknowledged =>
      isAcknowledged ? theme.palette.success.main : theme.palette.warning.main
  },
  buttonContainer: {
    padding: theme.spacing(2)
  },
  inactiveAlert: {
    marginTop: theme.spacing(2)
  }
}));

export function EmploymentInfo({ employment, spacing = 4 }) {
  const classes = useStyles(employment.isAcknowledged);

  const api = useApi();
  const alerts = useSnackbarAlerts();

  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  async function handleEmploymentValidation(accept) {
    alerts.withApiErrorHandling(
      async () => {
        const apiResponse = await api.graphQlMutate(
          accept ? VALIDATE_EMPLOYMENT_MUTATION : REJECT_EMPLOYMENT_MUTATION,
          {
            employmentId: employment.id
          }
        );
        await store.syncEntity(
          accept ? [apiResponse.data.employments.validateEmployment] : [],
          "employments",
          e => e.id === employment.id
        );
        store.batchUpdateStore();
        await broadCastChannel.postMessage("update");
      },
      "validate-employment",
      graphQLError => {
        if (graphQLErrorMatchesCode(graphQLError, "INVALID_RESOURCE")) {
          return "Opération impossible. Veuillez réessayer ultérieurement.";
        }
      }
    );
  }

  return (
    <>
      <Grid container wrap="wrap" spacing={spacing}>
        <Grid item>
          <InfoItem name="Entreprise" value={employment.company.name} />
        </Grid>
        <Grid item>
          <InfoItem name="SIREN" value={employment.company.siren} />
        </Grid>
        <Grid item>
          <InfoItem
            name="Début rattachement"
            value={frenchFormatDateString(employment.startDate)}
          />
        </Grid>
        <Grid item>
          <InfoItem
            name="Rôle"
            value={
              employment.hasAdminRights ? "Gestionnaire" : "Travailleur mobile"
            }
          />
        </Grid>
        <Grid item>
          <InfoItem
            name="Statut rattachement"
            value={
              <span className={classes.employmentStatus}>
                {employment.isAcknowledged ? "Accepté" : "En attente"}
              </span>
            }
            bold
          />
        </Grid>
      </Grid>
      {!employment.isAcknowledged && (
        <>
          {employment.isPrimary && (
            <Alert severity="info">
              La validation du rattachement vous donnera le droit d'enregistrer
              du temps de travail pour cette entreprise.
            </Alert>
          )}
          <Grid
            className={classes.buttonContainer}
            container
            justify="space-evenly"
            spacing={2}
          >
            <Grid item>
              <LoadingButton
                color="primary"
                variant="contained"
                onClick={() => handleEmploymentValidation(true)}
              >
                Valider le rattachement
              </LoadingButton>
            </Grid>
            <Grid item>
              <LoadingButton
                color="primary"
                variant="outlined"
                onClick={() =>
                  modals.open("confirmation", {
                    textButtons: true,
                    title: "Confirmer rejet du rattachement",
                    handleConfirm: async () =>
                      await handleEmploymentValidation(false)
                  })
                }
              >
                Rejeter
              </LoadingButton>
            </Grid>
          </Grid>
        </>
      )}
    </>
  );
}

function NoPrimaryEmploymentAlert() {
  return (
    <Alert severity="warning">
      Vous n'avez pas d'entreprise de rattachement principale et{" "}
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
  const employments = store.getEntity("employments");

  const modals = useModals();

  const [expandPrimaryCompany, setExpandPrimaryCompany] = React.useState(true);
  const [
    expandSecondaryCompanies,
    setExpandSecondaryCompanies
  ] = React.useState({});

  const primaryEmployment = employments.find(e => e.isPrimary);
  const secondaryEmployments = employments.filter(e => !e.isPrimary);

  const userInfo = store.userInfo();
  const isActive = userInfo.hasActivatedEmail;

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
                  !primaryEmployment
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
                  value={frenchFormatDateString(userInfo.birthDate)}
                />
              </Grid>
            )}
            <Grid item {...(isActive ? { sm: 6 } : { xs: 12 })} zeroMinWidth>
              <InfoItem
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
                    <Alert severity="error" className={classes.inactiveAlert}>
                      <AlertTitle className="bold">
                        Adresse email non activée
                      </AlertTitle>
                      Un email d'activation vous a été envoyé à l'adresse
                      ci-dessus. L'activation est nécessaire pour accéder aux
                      services Mobilic.
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
              employments.length > 1 ? "Mes rattachements" : "Mon entreprise"
            }
          >
            {secondaryEmployments.length > 0 && [
              <Box mb={6} key={0}>
                <Accordion
                  expanded={expandPrimaryCompany}
                  onChange={() =>
                    setExpandPrimaryCompany(!expandPrimaryCompany)
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography className="bold">
                      Entreprise principale
                      {primaryEmployment
                        ? ` : ${primaryEmployment.company.name}`
                        : ""}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {primaryEmployment ? (
                      <EmploymentInfo employment={primaryEmployment} />
                    ) : (
                      <NoPrimaryEmploymentAlert />
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>,
              ...secondaryEmployments.map(employment => (
                <Accordion
                  key={employment.id}
                  expanded={expandSecondaryCompanies[employment.id]}
                  onChange={() =>
                    setExpandSecondaryCompanies(prevState => ({
                      ...prevState,
                      [employment.id]: !prevState[employment.id]
                    }))
                  }
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      Entreprise secondaire : {employment.company.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <EmploymentInfo employment={employment} />
                  </AccordionDetails>
                </Accordion>
              ))
            ]}
            {secondaryEmployments.length === 0 && !primaryEmployment && (
              <NoPrimaryEmploymentAlert />
            )}
            {secondaryEmployments.length === 0 && primaryEmployment && (
              <EmploymentInfo employment={primaryEmployment} />
            )}
          </Section>
        )}
      </Container>
    </PaperContainer>
  ];
}
