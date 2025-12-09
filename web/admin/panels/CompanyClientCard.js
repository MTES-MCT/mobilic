import React from "react";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { DISMISS_THIRD_PARTY_COMPANY_TOKEN_MUTATION } from "common/utils/apiQueries/auth";

const useStyles = makeStyles((theme) => ({
  companyClientLine: {
    display: "flex"
  },
  clientLabel: {
    float: "left"
  },
  revokeAccessButton: {
    float: "right"
  }
}));

export function CompanyClientCard({
  authorizedClient,
  companyId,
  setAuthorizedClients
}) {
  const classes = useStyles();

  const api = useApi();
  const alerts = useSnackbarAlerts();

  const onRevokeAuthorizedClient = async () => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        DISMISS_THIRD_PARTY_COMPANY_TOKEN_MUTATION,
        {
          companyId: companyId,
          clientId: authorizedClient.id
        },
        { context: { nonPublicApi: true } }
      );
      setAuthorizedClients(apiResponse.data.dismissCompanyToken);
      alerts.success(
        `L'accès du logiciel ${authorizedClient.name} été supprimé avec succès`,
        "",
        6000
      );
    });
  };

  return (
    <Grid container>
      <Grid item xs={8}>
        <Typography>
          {`${authorizedClient.name} (Client ID : ${authorizedClient.id})`}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Button
          size="small"
          priority="secondary"
          onClick={onRevokeAuthorizedClient}
          className={classes.revokeAccessButton}
        >
          Retirer les accès
        </Button>
      </Grid>
      <Grid item xs={12} mt={1} mb={3}>
        <Divider className="hr-unstyled" />
      </Grid>
    </Grid>
  );
}
