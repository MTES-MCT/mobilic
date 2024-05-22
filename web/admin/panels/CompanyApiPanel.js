import React from "react";
import { useApi } from "common/utils/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  GENERATE_THIRD_PARTY_COMPANY_TOKEN_MUTATION,
  OAUTH_CLIENT_QUERY,
  THIRD_PARTY_CLIENTS_COMPANY_QUERY
} from "common/utils/apiQueries";
import { usePanelStyles } from "./Company";
import { currentUserId } from "common/utils/cookie";
import Skeleton from "@mui/material/Skeleton";
import { CompanyClientCard } from "./CompanyClientCard";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Alert } from "@mui/material";
import TextField from "common/utils/TextField";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useModals } from "common/utils/modals";

export default function CompanyApiPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const modals = useModals();

  const [authorizedClients, setAuthorizedClients] = React.useState([]);
  const [newClientId, setNewClientId] = React.useState("");
  const [
    loadingAuthorizedClients,
    setLoadingAuthorizedClients
  ] = React.useState(false);
  const [newTokenSectionVisible, setNewTokenSectionVisible] = React.useState(
    false
  );
  React.useEffect(async () => {
    const apiResponse = await api.graphQlQuery(
      THIRD_PARTY_CLIENTS_COMPANY_QUERY,
      {
        userId: currentUserId(),
        companyIds: [company.id]
      }
    );
    setAuthorizedClients(
      apiResponse?.data?.user?.adminedCompanies[0]?.authorizedClients
    );
    setLoadingAuthorizedClients(false);
  }, [company]);

  const classes = usePanelStyles();

  const confirmAddNewClientId = async () => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        GENERATE_THIRD_PARTY_COMPANY_TOKEN_MUTATION,
        {
          companyId: company.id,
          clientId: newClientId
        },
        { context: { nonPublicApi: true } }
      );
      const apiAccessTokens = apiResponse.data.generateCompanyToken;
      setAuthorizedClients([]);
      setAuthorizedClients(apiAccessTokens);
      setNewClientId("");
      setNewTokenSectionVisible(false);
      alerts.success(
        "L'autorisation a bien été accordée au logiciel'",
        "",
        6000
      );
    });
  };

  const onValidateNewClientId = async () => {
    if (isNaN(newClientId)) {
      alerts.error("Le client id renseigné n'est pas correct", "", 6000);
    } else if (authorizedClients.some(ac => ac.id === parseInt(newClientId))) {
      alerts.info(
        "Le client id renseigné est déjà associé à votre entreprise",
        "",
        6000
      );
    } else {
      await alerts.withApiErrorHandling(async () => {
        const apiResponse = await api.graphQlQuery(
          OAUTH_CLIENT_QUERY,
          {
            clientId: newClientId
          },
          { context: { nonPublicApi: true } }
        );
        const oAuthClient = apiResponse?.data?.oauthClient;
        if (!oAuthClient) {
          alerts.error("Le client id renseigné n'est pas correct", "", 6000);
        } else {
          modals.open("confirmation", {
            title: `Valider les droits du service tiers ${oAuthClient?.name}`,
            confirmButtonLabel: "Valider",
            cancelButtonLabel: "Annuler",
            content: (
              <>
                <Typography mb={2}>
                  Le client_id renseigné ({oAuthClient?.id}) correspond au
                  logiciel {oAuthClient?.name}
                </Typography>
                <Typography>
                  Les droits suivants lui seront attribués:
                </Typography>
                <ul>
                  <li>Rattacher des salariés à l'entreprise</li>
                  <li>
                    Effectuer des actions pour le compte de salariés (suite à
                    leur confirmation d'autorisation d'accès)
                  </li>
                </ul>
              </>
            ),
            handleConfirm: confirmAddNewClientId
          });
        }
      });
    }
  };

  return [
    <Grid key={0} container>
      <Grid item xs={6}>
        <Box className={classes.title}>
          <Typography variant="h4" component="h2">
            Mes logiciels autorisés{" "}
            {!loadingAuthorizedClients && (
              <span> ({authorizedClients?.length || 0})</span>
            )}
          </Typography>
        </Box>
      </Grid>
      {!newTokenSectionVisible && (
        <Grid item xs={6} className={classes.buttonAddToken}>
          <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={() => {
              setNewTokenSectionVisible(true);
            }}
          >
            Ajouter un Client ID
          </Button>
        </Grid>
      )}
    </Grid>,
    newTokenSectionVisible && (
      <Grid
        container
        alignItems={"center"}
        className={classes.addNewTokenSection}
      >
        <Grid item xs={12}>
          <Alert severity="info" className={classes.addNewTokenAlert}>
            <Typography className={classes.addNewTokenExplanation}>
              Rapprochez-vous de votre éditeur de logiciel pour obtenir son
              client_id.
            </Typography>
          </Alert>
        </Grid>
        <Grid item xs={12}>
          <Typography>client_id</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            required
            hiddenLabel
            variant="filled"
            size="small"
            style={{ width: "100%" }}
            value={newClientId}
            onChange={e => {
              setNewClientId(e.target.value);
            }}
            className={classes.newClientIdField}
          />
        </Grid>
        <Grid item xs={12} sm={6} mb={2}>
          <LoadingButton
            type="submit"
            size="small"
            color="primary"
            variant="contained"
            disabled={!newClientId}
            onClick={async e => {
              e.stopPropagation();
              await onValidateNewClientId();
            }}
            className={classes.validateNewClientIdButton}
          >
            Valider
          </LoadingButton>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => {
              setNewClientId("");
              setNewTokenSectionVisible(false);
            }}
          >
            Annuler
          </Button>
        </Grid>
      </Grid>
    ),
    loadingAuthorizedClients ? (
      <Skeleton key={2} variant="rectangular" width="100%" height={100} />
    ) : (
      <Box key={2} mt={4}>
        {authorizedClients.map(ac => (
          <CompanyClientCard
            key={ac.id}
            authorizedClient={ac}
            setAuthorizedClients={setAuthorizedClients}
            companyId={company.id}
          />
        ))}
      </Box>
    ),
    authorizedClients?.length > 0 && (
      <Alert severity="info" className={classes.addNewTokenAlert}>
        <Typography className={classes.addNewTokenExplanation}>
          Vous pouvez communiquer votre identifiant de société "{company.id}" à
          votre éditeur, afin qu'il puisse utiliser l'API Mobilic.
        </Typography>
      </Alert>
    )
  ];
}
