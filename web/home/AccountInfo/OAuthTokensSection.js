import { useApi } from "common/utils/api";
import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { currentUserId } from "common/utils/cookie";
import Grid from "@mui/material/Grid";
import { OAuthTokenCard } from "./OAuthTokenCard";
import Skeleton from "@mui/material/Skeleton";
import TextField from "common/utils/TextField";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import Notice from "../../common/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Section } from "../../common/Section";
import {
  CREATE_OAUTH_TOKEN_MUTATION,
  OAUTH_TOKEN_QUERY
} from "common/utils/apiQueries/auth";

const useStyles = makeStyles((theme) => ({
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
  const [newTokenSectionVisible, setNewTokenSectionVisible] =
    React.useState(false);
  const [loadingAccessTokens, setLoadingAccessTokens] = React.useState(false);

  React.useEffect(() => {
    const loadData = async () => {
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
    };
    loadData();
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
        const processedApiAccessTokens = apiAccessTokens.map((at) =>
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
    <Section>
      <Grid container>
        <Grid item xs={6}>
          <Typography className={classes.mainTitle} variant="h4" component="h2">
            Mon API Mobilic
          </Typography>
        </Grid>
        {!newTokenSectionVisible && (
          <Grid item xs={6} className={classes.buttonAddKey}>
            <Button
              size="small"
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
                <Notice
                  description="Rapprochez-vous de votre éditeur de logiciel pour obtenir son
              client_id."
                  sx={{ marginBottom: 2 }}
                  size="small"
                />{" "}
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
                  onChange={(e) => {
                    setNewClientId(e.target.value);
                  }}
                  className={classes.newClientIdField}
                />
              </Grid>
              <Grid item xs={12} sm={6} mb={2}>
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
            {accessTokens.map((at) => (
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
    </Section>
  );
}
