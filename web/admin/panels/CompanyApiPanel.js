import React from "react";
import { useApi } from "common/utils/api";
import { makeStyles } from "@mui/styles";
import { usePanelStyles } from "./Company";
import { currentUserId } from "common/utils/cookie";
import Skeleton from "@mui/material/Skeleton";
import { CompanyClientCard } from "./CompanyClientCard";
import TextField from "common/utils/TextField";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useModals } from "common/utils/modals";
import Notice from "../../common/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { THIRD_PARTY_CLIENTS_COMPANY_QUERY } from "common/utils/apiQueries/admin";
import {
  GENERATE_THIRD_PARTY_COMPANY_TOKEN_MUTATION,
  OAUTH_CLIENT_QUERY,
} from "common/utils/apiQueries/auth";

const useStyles = makeStyles((theme) => ({
  noticeSpacing: {
    marginBottom: theme.spacing(2),
  },
  fullWidthField: {
    width: "100%",
  },
  authorizedClientsList: {
    marginTop: theme.spacing(4),
  },
  heading: {
    ...theme.typography.h4,
  },
  paragraph: {
    ...theme.typography.body1,
  },
  paragraphSpacing: {
    ...theme.typography.body1,
    marginBottom: theme.spacing(2),
  },
  headerRow: {
    display: "flex",
  },
  headerCol: {
    flexBasis: "50%",
    maxWidth: "50%",
    boxSizing: "border-box",
  },
  gridItemFull: {
    flexBasis: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  gridItemTextField: {
    flexBasis: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    [theme.breakpoints.up("sm")]: {
      flexBasis: "50%",
      maxWidth: "50%",
    },
    [theme.breakpoints.up("md")]: {
      flexBasis: "25%",
      maxWidth: "25%",
    },
  },
  gridItemButtons: {
    flexBasis: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      flexBasis: "50%",
      maxWidth: "50%",
    },
  },
}));

export default function CompanyApiPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const modals = useModals();

  const [authorizedClients, setAuthorizedClients] = React.useState([]);
  const [newClientId, setNewClientId] = React.useState("");
  const [loadingAuthorizedClients, setLoadingAuthorizedClients] =
    React.useState(false);
  const [newTokenSectionVisible, setNewTokenSectionVisible] =
    React.useState(false);
  React.useEffect(() => {
    const loadData = async () => {
      const apiResponse = await api.graphQlQuery(
        THIRD_PARTY_CLIENTS_COMPANY_QUERY,
        {
          userId: currentUserId(),
          companyIds: [company.id],
        },
      );
      setAuthorizedClients(
        apiResponse?.data?.user?.adminedCompanies[0]?.authorizedClients,
      );
      setLoadingAuthorizedClients(false);
    };
    loadData();
  }, [company]);

  const classes = usePanelStyles();
  const localClasses = useStyles();

  const confirmAddNewClientId = async () => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        GENERATE_THIRD_PARTY_COMPANY_TOKEN_MUTATION,
        {
          companyId: company.id,
          clientId: newClientId,
        },
        { context: { nonPublicApi: true } },
      );
      const apiAccessTokens = apiResponse.data.generateCompanyToken;
      setAuthorizedClients([]);
      setAuthorizedClients(apiAccessTokens);
      setNewClientId("");
      setNewTokenSectionVisible(false);
      alerts.success(
        "L'autorisation a bien été accordée au logiciel'",
        "",
        6000,
      );
    });
  };

  const onValidateNewClientId = async () => {
    if (isNaN(newClientId)) {
      alerts.error("Le client id renseigné n'est pas correct", "", 6000);
    } else if (
      authorizedClients.some((ac) => ac.id === parseInt(newClientId))
    ) {
      alerts.info(
        "Le client id renseigné est déjà associé à votre entreprise",
        "",
        6000,
      );
    } else {
      await alerts.withApiErrorHandling(async () => {
        const apiResponse = await api.graphQlQuery(
          OAUTH_CLIENT_QUERY,
          {
            clientId: newClientId,
          },
          { context: { nonPublicApi: true } },
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
                <p className={localClasses.paragraphSpacing}>
                  Le client_id renseigné ({oAuthClient?.id}) correspond au
                  logiciel {oAuthClient?.name}
                </p>
                <p className={localClasses.paragraph}>
                  Les droits suivants lui seront attribués:
                </p>
                <ul>
                  <li>Rattacher des salariés à l'entreprise</li>
                  <li>
                    Effectuer des actions pour le compte de salariés (suite à
                    leur confirmation d'autorisation d'accès)
                  </li>
                </ul>
              </>
            ),
            handleConfirm: confirmAddNewClientId,
          });
        }
      });
    }
  };

  return [
    <div key={0} className={localClasses.headerRow}>
      <div className={localClasses.headerCol}>
        <div className={classes.title}>
          <h2 className={localClasses.heading}>
            Mes logiciels autorisés{" "}
            {!loadingAuthorizedClients && (
              <span> ({authorizedClients?.length || 0})</span>
            )}
          </h2>
        </div>
      </div>
      {!newTokenSectionVisible && (
        <div className={`${localClasses.headerCol} ${classes.buttonAddToken}`}>
          <Button
            size="small"
            onClick={() => {
              setNewTokenSectionVisible(true);
            }}
          >
            Ajouter un Client ID
          </Button>
        </div>
      )}
    </div>,
    newTokenSectionVisible && (
      <div className={classes.addNewTokenSection}>
        <div className={localClasses.gridItemFull}>
          <Notice
            description="Rapprochez-vous de votre éditeur de logiciel pour obtenir son
              client_id."
            className={localClasses.noticeSpacing}
            size="small"
          />
        </div>
        <div className={localClasses.gridItemFull}>
          <p className={localClasses.paragraph}>client_id</p>
        </div>
        <div className={localClasses.gridItemTextField}>
          <TextField
            required
            hiddenLabel
            variant="filled"
            size="small"
            value={newClientId}
            onChange={(e) => {
              setNewClientId(e.target.value);
            }}
            className={`${classes.newClientIdField} ${localClasses.fullWidthField}`}
          />
        </div>
        <div className={localClasses.gridItemButtons}>
          <LoadingButton
            type="submit"
            size="small"
            disabled={!newClientId}
            onClick={async (e) => {
              e.stopPropagation();
              await onValidateNewClientId();
            }}
            className={classes.validateNewClientIdButton}
          >
            Valider
          </LoadingButton>
          <Button
            size="small"
            priority="secondary"
            onClick={() => {
              setNewClientId("");
              setNewTokenSectionVisible(false);
            }}
          >
            Annuler
          </Button>
        </div>
      </div>
    ),
    loadingAuthorizedClients ? (
      <Skeleton key={2} variant="rectangular" width="100%" height={100} />
    ) : (
      <div key={2} className={localClasses.authorizedClientsList}>
        {authorizedClients.map((ac) => (
          <CompanyClientCard
            key={ac.id}
            authorizedClient={ac}
            setAuthorizedClients={setAuthorizedClients}
            companyId={company.id}
          />
        ))}
      </div>
    ),
    authorizedClients?.length > 0 && (
      <Notice
        description={
          <>
            Vous pouvez communiquer votre identifiant de société "{company.id}"
            à votre éditeur, afin qu'il puisse utiliser l'API Mobilic.
          </>
        }
        className={localClasses.noticeSpacing}
        size="small"
      />
    ),
  ];
}
