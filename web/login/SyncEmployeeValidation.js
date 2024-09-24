import React from "react";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { Header } from "../common/Header";
import { useSnackbarAlerts } from "../common/Snackbar";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import {
  THIRD_PARTY_CLIENT_EMPLOYMENT_ACCEPT,
  THIRD_PARTY_CLIENT_EMPLOYMENT_QUERY
} from "common/utils/apiQueries";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import { useModals } from "common/utils/modals";
import { LoadingButton } from "common/components/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { formatApiError, graphQLErrorMatchesCode } from "common/utils/errors";
import { usePageTitle } from "../common/UsePageTitle";
import Notice from "../common/Notice";

const useStyles = makeStyles(theme => ({
  container: {
    textAlign: "left",
    paddingRight: theme.spacing(12),
    paddingLeft: theme.spacing(12)
  },
  openCGULink: {
    cursor: "pointer",
    textDecoration: "underline"
  },
  explanationBlock: {
    marginTop: theme.spacing(4)
  },
  confirmBlock: {
    marginTop: theme.spacing(4)
  },
  validationButton: {
    float: "right"
  }
}));

export function SyncEmployeeValidation() {
  usePageTitle("Rattachement Compte - Mobilic");
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const location = useLocation();
  const modals = useModals();

  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [invitationToken, setInvitationToken] = React.useState("");
  const [clientId, setClientId] = React.useState("");
  const [employmentId, setEmploymentId] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [
    mustAcceptAccountCreation,
    setMustAcceptAccountCreation
  ] = React.useState(false);
  const [hasCreatedAccount, setHasCreatedAccount] = React.useState(false);
  const [
    mustAcceptEmploymentCreation,
    setMustAcceptEmploymentCreation
  ] = React.useState(false);
  const [
    hasAcceptedTokenGeneration,
    setHasAcceptedTokenGeneration
  ] = React.useState(false);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const queryToken = queryString.get("token");
    const queryClientId = queryString.get("client_id");
    const queryEmploymentId = queryString.get("employment_id");
    setInvitationToken(queryToken);
    setClientId(queryClientId);
    setEmploymentId(queryEmploymentId);
    setLoading(true);
    const loadData = async () => {
      try {
        const apiResponse = await api.graphQlQuery(
          THIRD_PARTY_CLIENT_EMPLOYMENT_QUERY,
          {
            clientId: queryClientId,
            employmentId: queryEmploymentId,
            invitationToken: queryToken
          },
          { context: { nonPublicApi: true } }
        );
        const link = apiResponse.data.clientEmploymentLink;
        const user = link?.employment?.user;

        setClientName(link?.clientName);
        setCompanyName(link?.employment?.company?.name);
        setMustAcceptEmploymentCreation(!link?.employment?.isAcknowledged);
        setEmail(user?.email);
        setMustAcceptAccountCreation(
          !user?.hasConfirmedEmail || !user?.hasActivatedEmail
        );
      } catch (err) {
        const errorMessage = formatApiError(err, gqlError => {
          if (graphQLErrorMatchesCode(gqlError, "AUTHORIZATION_ERROR")) {
            return "Paramètres invalides. Veuillez suivre le lien d'activation inclus dans le mail reçu. Si le problème persiste, contactez votre éditeur de logiciel.";
          }
        });
        setApiError(errorMessage);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  React.useEffect(() => {
    if (mustAcceptAccountCreation) {
      openCGUModal();
    }
  }, [mustAcceptAccountCreation]);

  const openCGUModal = () => {
    modals.open("cgu", {
      handleAccept: () => {
        setMustAcceptAccountCreation(false);
        setHasCreatedAccount(true);
      },
      handleReject: () => {
        alerts.warning(
          "Vous devez d'abord accepter les CGU pour pouvoir confirmer l'accès au logiciel tiers",
          {},
          6000
        );
      }
    });
  };

  const confirmTokenGeneration = async () => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        THIRD_PARTY_CLIENT_EMPLOYMENT_ACCEPT,
        {
          clientId: clientId,
          employmentId: employmentId,
          invitationToken: invitationToken
        },
        { context: { nonPublicApi: true } }
      );
      const success = apiResponse?.data?.generateEmploymentToken?.success;
      if (success) {
        setHasAcceptedTokenGeneration(true);
      } else {
        alerts.error(
          "Une erreur est survenue lors de la confirmation d'autorisation d'accès. Veuillez réessayer.",
          {},
          6000
        );
      }
    });
  };

  return (
    <>
      <Header />
      <Typography color="error" mt={4}>
        {apiError}
      </Typography>
      {!apiError && (
        <>
          {hasAcceptedTokenGeneration && (
            <>
              <Typography>
                Merci, nous avons bien pris en compte votre confirmation
                d'autorisation d'accès.
              </Typography>
              {hasCreatedAccount && (
                <Typography>
                  Votre compte Mobilic a bien été créé avec l'adresse mail
                  suivante : {email}.
                </Typography>
              )}
            </>
          )}
          {!hasAcceptedTokenGeneration && loading && (
            <CircularProgress
              style={{ position: "absolute" }}
              color="inherit"
              size="1rem"
            />
          )}
          {!hasAcceptedTokenGeneration && !loading && (
            <>
              <PaperContainer>
                <Container className={classes.container} maxWidth="md">
                  <PaperContainerTitle className="centered">
                    Confirmation d'autorisation d'accès
                  </PaperContainerTitle>
                  {mustAcceptAccountCreation && (
                    <Notice
                      type="warning"
                      sx={{ marginTop: 2 }}
                      description={
                        <Typography>
                          Vous devez d'abord accepter les Conditions Générales
                          pour pouvoir confirmer l'accès au logiciel{" "}
                          {clientName}.
                          <br />
                          <span
                            className={classes.openCGULink}
                            onClick={openCGUModal}
                          >
                            Ouvrir les CGU
                          </span>{" "}
                          pour continuer.
                        </Typography>
                      }
                    />
                  )}
                  <Typography variant="h6" className={classes.explanationBlock}>
                    Votre entreprise {companyName} utilise le logiciel de
                    gestion {clientName}.<br />
                    Votre validation est requise pour finaliser la demande
                    d'accès à ce logiciel.
                  </Typography>
                  <Typography className={classes.confirmBlock}>
                    En confirmant, vous autorisez :
                    <ul>
                      {mustAcceptEmploymentCreation && (
                        <li>
                          Le rattachement de votre compte Mobilic à l'entreprise{" "}
                          <strong>{companyName}</strong>
                        </li>
                      )}
                      <li>
                        L'accès à votre compte par le logiciel{" "}
                        <strong>{clientName}</strong>
                      </li>
                    </ul>
                  </Typography>
                  <LoadingButton
                    disabled={mustAcceptAccountCreation}
                    aria-label="Confirmer"
                    variant="contained"
                    color="primary"
                    size="small"
                    className={classes.validationButton}
                    onClick={async e => {
                      e.stopPropagation();
                      await confirmTokenGeneration();
                    }}
                  >
                    Confirmer
                  </LoadingButton>
                </Container>
              </PaperContainer>
            </>
          )}
        </>
      )}
    </>
  );
}
