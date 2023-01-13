import { useApi } from "common/utils/api";
import {
  CREATE_OAUTH_TOKEN_MUTATION,
  OAUTH_TOKEN_QUERY
} from "common/utils/apiQueries";
import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { currentUserId } from "common/utils/cookie";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { OAuthTokenCard } from "./OAuthTokenCard";
import Skeleton from "@mui/material/Skeleton";
import { Alert } from "@mui/material";
import TextField from "common/utils/TextField";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";

const useStyles = makeStyles(theme => ({
  section: {
    width: "100%"
  },
  mainTitle: {
    marginBottom: theme.spacing(3),
    textAlign: "left"
  },
  buttonAddKey: {
    textAlign: "right"
  },
  addNewTokenSection: {
    marginBottom: theme.spacing(4)
  },
  validateNewClientIdButton: {
    marginRight: theme.spacing(2)
  },
  newClientIdField: {
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  addNewTokenAlert: {
    marginBottom: theme.spacing(2)
  },
  addNewTokenExplanation: {
    fontSize: "0.875rem"
  },
  alreadyGeneratedKeysTitle: {
    color: theme.palette.grey[600]
  }
}));

export function OAuthTokenSection() {
  const classes = useStyles();

  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [accessTokens, setAccessTokens] = React.useState([]);
  const [newClientId, setNewClientId] = React.useState("");
  const [newTokenSectionVisible, setNewTokenSectionVisible] = React.useState(
    false
  );
  const [loadingAccessTokens, setLoadingAccessTokens] = React.useState(false);

  React.useEffect(async () => {
    setLoadingAccessTokens(true);
    const apiResponse = await api.graphQlQuery(
      OAUTH_TOKEN_QUERY,
      {
        userId: currentUserId()
      },
      { context: { nonPublicApi: true } }
    );
    setAccessTokens(apiResponse.data.oauthAccessTokens);
    setLoadingAccessTokens(false);
  }, []);

  const onValidateNewClientId = async () => {
    if (isNaN(newClientId)) {
      alerts.error("Le client id renseigné n'est pas correct", "", 6000);
    } else {
      await alerts.withApiErrorHandling(async () => {
        const apiResponse = await api.graphQlMutate(
          CREATE_OAUTH_TOKEN_MUTATION,
          {
            userId: currentUserId(),
            clientId: newClientId
          },
          { context: { nonPublicApi: true } }
        );
        const apiAccessTokens = apiResponse.data.createOauthToken;
        const processedApiAccessTokens = apiAccessTokens.map(at =>
          at.clientId?.toString() === newClientId ? { ...at, open: true } : at
        );
        const newKeyCreated =
          accessTokens?.length !== processedApiAccessTokens?.length;
        setAccessTokens([]);
        setAccessTokens(processedApiAccessTokens);
        setNewClientId("");
        setNewTokenSectionVisible(false);
        if (newKeyCreated) {
          alerts.success("La clé API a été ajoutée avec succès", "", 6000);
        } else {
          alerts.info(
            "Une clé API valide existe déjà pour ce logiciel ",
            "",
            6000
          );
        }
      });
    }
  };

  return (
    <Box my={6} mb={6} className={classes.section}>
      <Grid container>
        <Grid item xs={6}>
          <Typography className={classes.mainTitle} variant="h5">
            Mon API Mobilic
          </Typography>
        </Grid>
        {!newTokenSectionVisible && (
          <Grid item xs={6} className={classes.buttonAddKey}>
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => {
                setNewTokenSectionVisible(true);
              }}
            >
              Générer une clé API
            </Button>
          </Grid>
        )}
        {newTokenSectionVisible && (
          <Grid item xs={12} className={classes.addNewTokenSection}>
            <Grid container alignItems={"center"}>
              <Grid item xs={12}>
                <Alert severity="info" className={classes.addNewTokenAlert}>
                  <Typography className={classes.addNewTokenExplanation}>
                    Rapprochez-vous de votre éditeur de logiciel pour obtenir
                    son client_id.
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
          </Grid>
        )}

        {loadingAccessTokens ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : (
          <>
            {accessTokens.length > 0 && (
              <Typography
                align="left"
                className={classes.alreadyGeneratedKeysTitle}
                variant="overline"
              >
                CLÉ(S) API GÉNÉRÉE(S)
              </Typography>
            )}
            {accessTokens.map(at => (
              <Grid item xs={12} key={at.token} mb={2}>
                <OAuthTokenCard
                  accessTokenInfo={at}
                  setAccessTokens={setAccessTokens}
                />
              </Grid>
            ))}
          </>
        )}
      </Grid>
    </Box>
  );
}
