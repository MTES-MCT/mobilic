import React from "react";
import { useApi } from "common/utils/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { THIRD_PARTY_CLIENTS_COMPANY_QUERY } from "common/utils/apiQueries";
import { usePanelStyles } from "./Company";
import { currentUserId } from "common/utils/cookie";
import Skeleton from "@mui/material/Skeleton";
import { CompanyClientCard } from "./CompanyClientCard";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Alert } from "@mui/material";
import TextField from "common/utils/TextField";
import { LoadingButton } from "common/components/LoadingButton";

export default function CompanyApiPanel({ company }) {
  const api = useApi();

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
    setLoadingAuthorizedClients(true);
    const apiResponse = await api.graphQlMutate(
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

  return [
    <Grid key={0} container>
      <Grid item xs={6}>
        <Box className={classes.title}>
          <Typography variant="h4">
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
      <Grid item xs={12} className={classes.addNewTokenSection}>
        <Grid container alignItems={"center"}>
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
          <Grid item xs={12} sm={6}>
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
                // await onValidateNewClientId();
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
      </Grid>
    ),
    loadingAuthorizedClients ? (
      <Skeleton variant="rectangular" width="100%" height={100} />
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
    )
  ];
}
