import { useApi } from "common/utils/api";
import { OAUTH_TOKEN_QUERY } from "common/utils/apiQueries";
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
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  addNewTokenAlert: {
    marginBottom: theme.spacing(2)
  },
  addNewTokenExplanation: {
    fontSize: "0.875rem"
  }
}));

export function OAuthTokenSection() {
  const classes = useStyles();

  const api = useApi();
  const [accessTokens, setAccessTokens] = React.useState([]);
  const [newTokenSectionVisible, setNewTokenSectionVisible] = React.useState(
    false
  );
  const [loadingAccessTokens, setLoadingAccessTokens] = React.useState(false);

  React.useEffect(async () => {
    setLoadingAccessTokens(true);
    const apiResponse = await api.graphQlMutate(
      OAUTH_TOKEN_QUERY,
      {
        userId: currentUserId()
      },
      { context: { nonPublicApi: true } }
    );
    setAccessTokens(apiResponse.data.oauthAccessTokens);
    setLoadingAccessTokens(false);
  }, []);

  return (
    <Box my={6} mb={6} className={classes.section} sp>
      <Grid container>
        <Grid item xs={6}>
          <Typography className={classes.mainTitle} variant="h5">
            Mon API Mobilic
          </Typography>
        </Grid>
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
                <Typography>client_ID</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  hiddenLabel
                  variant="filled"
                  size="small"
                  style={{ width: "100%" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    setNewTokenSectionVisible(true);
                  }}
                  className={classes.validateNewClientIdButton}
                >
                  Valider
                </Button>
                <Button
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={() => {
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
          accessTokens.map(at => (
            <Grid item xs={12} key={at.token}>
              <OAuthTokenCard accessTokenInfo={at} />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
