import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "./Snackbar";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { useModals } from "common/utils/modals";
import {
  REJECT_EMPLOYMENT_MUTATION,
  VALIDATE_EMPLOYMENT_MUTATION
} from "common/utils/apiQueries";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import Grid from "@mui/material/Grid";
import { InfoItem } from "../home/InfoField";
import { frenchFormatDateStringOrTimeStamp } from "common/utils/time";
import Alert from "@mui/material/Alert";
import { LoadingButton } from "common/components/LoadingButton";
import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useTheme from "@mui/styles/useTheme";
import {
  EMPLOYMENT_ROLE,
  EMPLOYMENT_STATUS,
  getEmploymentsStatus
} from "common/utils/employments";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ThirdPartyEmploymentAccess from "./ThirdPartyEmploymentAccess";

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
  }
}));

function EMPLOYMENT_STATUS_TO_TEXT_AND_COLOR(theme) {
  return {
    [EMPLOYMENT_STATUS.active]: ["Actif", theme.palette.success.main],
    [EMPLOYMENT_STATUS.pending]: ["À valider", theme.palette.warning.main],
    [EMPLOYMENT_STATUS.future]: ["À venir", theme.palette.warning.main],
    [EMPLOYMENT_STATUS.ended]: ["Terminé", theme.palette.error.main]
  };
}

export function EmploymentInfoCard({
  employment,
  spacing = 4,
  hideRole = false,
  hideStatus = false,
  hideActions = false,
  lightenIfEnded = true,
  defaultOpen = false
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const classes = useStyles();

  const api = useApi();
  const alerts = useSnackbarAlerts();

  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  async function handleEmploymentValidation(accept) {
    await alerts.withApiErrorHandling(
      async () => {
        const apiResponse = await api.graphQlMutate(
          accept ? VALIDATE_EMPLOYMENT_MUTATION : REJECT_EMPLOYMENT_MUTATION,
          {
            employmentId: employment.id
          }
        );
        if (accept) {
          await store.updateEntityObject({
            objectId: employment.id,
            entity: "employments",
            update: apiResponse.data.employments.validateEmployment,
            createOrReplace: true
          });
        } else await store.deleteEntityObject(employment.id, "employments");

        store.batchUpdate();
        await broadCastChannel.postMessage("update");
      },
      "validate-employment",
      graphQLError => {
        if (graphQLErrorMatchesCode(graphQLError, "INVALID_RESOURCE")) {
          return "Opération impossible. Veuillez réessayer ultérieurement.";
        }
      }
    );
  }

  const status = getEmploymentsStatus(employment);

  const [statusText, statusColor] = EMPLOYMENT_STATUS_TO_TEXT_AND_COLOR(
    useTheme()
  )[status];

  return (
    <Accordion
      variant="outlined"
      expanded={open}
      onChange={(event, open_) => setOpen(open_)}
      className={
        status === EMPLOYMENT_STATUS.ended && lightenIfEnded
          ? classes.ended
          : ""
      }
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
              {employment.company.legalName || employment.company.name}
            </Typography>
          </Grid>
          {!hideStatus && (
            <Grid item>
              <Typography style={{ color: statusColor, fontWeight: "bold" }}>
                {statusText}
              </Typography>
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.employmentDetails}>
        <Grid container wrap="wrap" spacing={spacing}>
          <Grid item>
            <InfoItem name="SIREN" value={employment.company.siren} />
          </Grid>
          <Grid item>
            <InfoItem
              name="SIRETS"
              value={employment.company.sirets?.join(", ")}
            />
          </Grid>
          <Grid item>
            <InfoItem
              name="Début rattachement"
              value={frenchFormatDateStringOrTimeStamp(employment.startDate)}
            />
          </Grid>
          <Grid item>
            <InfoItem
              name="Fin rattachement"
              value={
                employment.endDate
                  ? frenchFormatDateStringOrTimeStamp(employment.endDate)
                  : ""
              }
            />
          </Grid>
          {!hideRole && (
            <Grid item>
              <InfoItem
                name="Rôle"
                value={
                  employment.hasAdminRights
                    ? EMPLOYMENT_ROLE.admin
                    : EMPLOYMENT_ROLE.employee
                }
              />
            </Grid>
          )}
          {!hideActions && (
            <Grid item xs="12">
              <ThirdPartyEmploymentAccess
                employmentId={employment.id}
                clients={employment.authorizedClients}
              />
            </Grid>
          )}
        </Grid>

        {!hideStatus && !hideActions && status === EMPLOYMENT_STATUS.ended && (
          <Alert severity="warning">
            L'entreprise a mis un terme à votre rattachement. Vous ne pouvez
            plus saisir de temps de travail pour cette entreprise.
          </Alert>
        )}
        {!hideStatus && !hideActions && status === EMPLOYMENT_STATUS.pending && (
          <>
            <Alert severity="info">
              La validation du rattachement vous donnera le droit d'enregistrer
              du temps de travail pour cette entreprise.
            </Alert>
            <Grid
              className={classes.buttonContainer}
              container
              justifyContent="space-evenly"
              spacing={2}
            >
              <Grid item>
                <LoadingButton
                  color="primary"
                  variant="contained"
                  onClick={async () => await handleEmploymentValidation(true)}
                >
                  Valider le rattachement
                </LoadingButton>
              </Grid>
              <Grid item>
                <LoadingButton
                  color="primary"
                  variant="outlined"
                  onClick={() =>
                    modals.open("confirmation", {
                      textButtons: true,
                      title: "Confirmer rejet du rattachement",
                      handleConfirm: async () =>
                        await handleEmploymentValidation(false)
                    })
                  }
                >
                  Rejeter
                </LoadingButton>
              </Grid>
            </Grid>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
