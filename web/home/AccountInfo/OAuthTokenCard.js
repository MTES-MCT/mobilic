import Grid from "@mui/material/Grid";
import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { InfoItem } from "../InfoField";
import Button from "@mui/material/Button";
import classNames from "classnames";

const useStyles = makeStyles(theme => ({
  companyName: {
    fontWeight: "bold",
    overflowWrap: "anywhere"
  },
  buttonContainer: {
    padding: theme.spacing(2)
  },
  ended: {
    opacity: 0.5
  },
  employmentDetails: {
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

export function OAuthTokenCard({ accessTokenInfo }) {
  const [open, setOpen] = React.useState(false);

  const classes = useStyles();

  // const api = useApi();
  // const alerts = useSnackbarAlerts();
  //
  // const store = useStoreSyncedWithLocalStorage();
  //
  // async function handleEmploymentValidation(accept) {
  //   await alerts.withApiErrorHandling(
  //     async () => {
  //       const apiResponse = await api.graphQlMutate(
  //         accept ? VALIDATE_EMPLOYMENT_MUTATION : REJECT_EMPLOYMENT_MUTATION,
  //         {
  //           employmentId: employment.id
  //         }
  //       );
  //       if (accept) {
  //         await store.updateEntityObject({
  //           objectId: employment.id,
  //           entity: "employments",
  //           update: apiResponse.data.employments.validateEmployment,
  //           createOrReplace: true
  //         });
  //       } else await store.deleteEntityObject(employment.id, "employments");
  //
  //       store.batchUpdate();
  //       await broadCastChannel.postMessage("update");
  //     },
  //     "validate-employment",
  //     graphQLError => {
  //       if (graphQLErrorMatchesCode(graphQLError, "INVALID_RESOURCE")) {
  //         return "Opération impossible. Veuillez réessayer ultérieurement.";
  //       }
  //     }
  //   );
  // }

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
            <Typography className={classes.companyName}>
              {accessTokenInfo.clientName}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.employmentDetails}>
        <Grid container wrap="wrap">
          <Grid item xs={12} sm={8}>
            <InfoItem name="CLÉ API" value={accessTokenInfo.token} />
          </Grid>
          <Grid item xs={12} sm={4} className={classes.buttonAddKey}>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => {}}
              className={classes.actionButton}
            >
              Supprimer la clé
            </Button>
            <Button
              size="small"
              color="primary"
              variant="contained"
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
