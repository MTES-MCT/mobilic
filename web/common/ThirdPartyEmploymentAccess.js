import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { useApi } from "common/utils/api";
import { DISMISS_THIRD_PARTY_EMPLOYMENT_TOKEN_MUTATION } from "common/utils/apiQueries";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import React from "react";
import { useSnackbarAlerts } from "./Snackbar";

const useStyles = makeStyles(theme => ({
  fieldName: {
    color: theme.palette.grey[600]
  },
  fieldValue: {
    fontWeight: 500,
    whiteSpace: "inherit"
  },
  clientRow: {
    display: "flex",
    flexWrap: "noWrap",
    justifyContent: "space-between",
    marginTop: theme.spacing(1)
  }
}));

const ThirdPartyEmploymentAccess = ({ employmentId, clients }) => {
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();

  if (!clients || clients.length === 0) return null;

  const removeClientAccess = async clientId => {
    await alerts.withApiErrorHandling(
      async () => {
        const apiResponse = await api.graphQlMutate(
          DISMISS_THIRD_PARTY_EMPLOYMENT_TOKEN_MUTATION,
          { employmentId, clientId },
          { context: { nonPublicApi: true } }
        );
        if (apiResponse.data?.dismissEmploymentToken.success) {
          const employments = store.getEntity("employments");
          const currentEmployment = employments.find(
            employment => employment.id === employmentId
          );
          const authorizedClientsWithoutDismissedOne = currentEmployment.authorizedClients.filter(
            client => client.id !== clientId
          );
          await store.updateEntityObject({
            objectId: employmentId,
            entity: "employments",
            update: {
              ...currentEmployment,
              authorizedClients: authorizedClientsWithoutDismissedOne
            },
            createOrReplace: true
          });

          store.batchUpdate();
          await broadCastChannel.postMessage("update");
        } else {
          throw Error();
        }
      },
      "dismiss-client-employment",
      graphQLError => {
        if (graphQLErrorMatchesCode(graphQLError, "INVALID_RESOURCE")) {
          return "Opération impossible. Veuillez réessayer ultérieurement.";
        }
      }
    );
  };

  return (
    <>
      <Typography align="left" className={classes.fieldName} variant="overline">
        Autorisations d'accès aux services tiers
      </Typography>
      {clients.map(client => (
        <div key={client.id} className={classes.clientRow}>
          <Typography noWrap align="left" className={classes.fieldValue}>
            Logiciel {client.name}
          </Typography>
          <Button
            size="small"
            color="primary"
            variant="outlined"
            onClick={() => removeClientAccess(client.id)}
            className={classes.actionButton}
          >
            Retirer l'accès
          </Button>
        </div>
      ))}
    </>
  );
};

export default ThirdPartyEmploymentAccess;
