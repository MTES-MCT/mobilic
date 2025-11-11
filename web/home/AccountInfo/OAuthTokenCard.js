import Grid from "@mui/material/Grid";
import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { InfoItem } from "../InfoField";
import classNames from "classnames";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { REVOKE_OAUTH_TOKEN_MUTATION } from "common/utils/apiQueries/auth";

const useStyles = makeStyles((theme) => ({
  clientName: {
    fontWeight: "bold",
    overflowWrap: "anywhere"
  },
  buttonContainer: {
    padding: theme.spacing(2)
  },
  clientDetails: {
    display: "block"
  },
  tokenText: {
    marginBottom: theme.spacing(2)
  },
  actionButton: {
    width: "100%"
  },
  copyTokenButton: {
    marginTop: theme.spacing(2)
  }
}));

export function OAuthTokenCard({ accessTokenInfo, setAccessTokens }) {
  const [open, setOpen] = React.useState(accessTokenInfo?.open || false);

  const classes = useStyles();

  const api = useApi();
  const alerts = useSnackbarAlerts();

  const onRevokeToken = async (tokenId) => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        REVOKE_OAUTH_TOKEN_MUTATION,
        {
          tokenId: tokenId
        },
        { context: { nonPublicApi: true } }
      );
      setAccessTokens(apiResponse.data.revokeOauthToken);
      alerts.success("La clé API a été supprimée avec succès", "", 6000);
    });
  };

  return (
    <Accordion
      variant="outlined"
      expanded={open}
      onChange={(event, open_) => setOpen(open_)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid
          container
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          wrap="nowrap"
        >
          <Grid item>
            <Typography className={classes.clientName}>
              {accessTokenInfo.clientName}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.clientDetails}>
        <Grid container wrap="wrap">
          <Grid item xs={12} sm={8} mb={2}>
            <InfoItem name="CLÉ API" value={accessTokenInfo.token} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              priority="secondary"
              size="small"
              onClick={() => {
                onRevokeToken(accessTokenInfo.id);
              }}
              className={classes.actionButton}
            >
              Supprimer la clé
            </Button>
            <Button
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(accessTokenInfo.token);
              }}
              className={classNames(
                classes.actionButton,
                classes.copyTokenButton
              )}
            >
              Copier la clé
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
