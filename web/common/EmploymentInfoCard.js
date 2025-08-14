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
import { LoadingButton } from "common/components/LoadingButton";
import React, { useMemo } from "react";
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
import { HideEmail } from "../home/HideEmail";
import { getNextHeadingComponent } from "common/utils/html";
import { formatActivity } from "common/utils/businessTypes";
import Notice from "./Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Stack } from "@mui/material";
import { TextBadge } from "./Certification";
import { useIsWidthDown } from "common/utils/useWidth";

const useStyles = makeStyles(theme => ({
  companyName: {
    fontWeight: "bold",
    overflowWrap: "anywhere",
    flexGrow: 1
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
    [EMPLOYMENT_STATUS.ended]: ["Terminé", theme.palette.error.main],
    [EMPLOYMENT_STATUS.ceased]: ["Cessée", theme.palette.error.main]
  };
}

export function EmploymentInfoCard({
  employment,
  spacing = 4,
  hideRole = false,
  hideStatus = false,
  hideActions = false,
  showAdminEmails = false,
  lightenIfEnded = true,
  defaultOpen = false,
  hideBusiness = false,
  headingComponent
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const emailsCurrentAdmins = useMemo(
    () =>
      employment?.company.currentAdmins?.map(admin => admin.email).join(";"),
    [employment]
  );

  const {
    isCertified,
    certificationMedal
  } = employment.company.currentCompanyCertification;

  const emailsCurrentAdminsDisplay = useMemo(
    () => (
      <ul
        style={{
          listStyleType: "none",
          paddingInlineStart: "0px",
          margin: "0px"
        }}
      >
        {employment?.company.currentAdmins?.map(admin => (
          <li
            key={admin.email}
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
              maxWidth: "80vw"
            }}
          >
            {admin.email}
          </li>
        ))}
      </ul>
    ),
    [employment]
  );

  const classes = useStyles();

  const api = useApi();
  const alerts = useSnackbarAlerts();

  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  const isMobile = useIsWidthDown("sm");

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
        (status === EMPLOYMENT_STATUS.ended ||
          status === EMPLOYMENT_STATUS.ceased) &&
        lightenIfEnded
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
          <Grid item xs={8} sm={9}>
            {isMobile ? (
              <Stack direction="column" rowGap={1}>
                {isCertified && <TextBadge medal={certificationMedal} />}
                <Typography
                  className={classes.companyName}
                  component={headingComponent}
                >
                  {employment.company.legalName || employment.company.name}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row">
                <Typography
                  className={classes.companyName}
                  component={headingComponent}
                >
                  {employment.company.legalName || employment.company.name}
                </Typography>
                {isCertified && <TextBadge medal={certificationMedal} />}
              </Stack>
            )}
          </Grid>
          {!hideStatus && (
            <Grid item xs={4} sm={3} pr={1}>
              <Typography
                style={{
                  color: statusColor,
                  fontWeight: "bold",
                  textAlign: "right"
                }}
              >
                {statusText}
              </Typography>
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.employmentDetails}>
        <Grid container wrap="wrap" spacing={spacing}>
          <Grid item xs={6}>
            <InfoItem
              name="SIREN"
              value={employment.company.siren}
              titleProps={{
                component: getNextHeadingComponent(headingComponent)
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoItem
              name="SIRETS"
              value={employment.company.sirets?.join(", ")}
              titleProps={{
                component: getNextHeadingComponent(headingComponent)
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoItem
              name="Début rattachement"
              value={frenchFormatDateStringOrTimeStamp(employment.startDate)}
              titleProps={{
                component: getNextHeadingComponent(headingComponent)
              }}
              uppercaseTitle={false}
            />
          </Grid>
          <Grid item xs={6}>
            <InfoItem
              name="Fin rattachement"
              value={
                employment.endDate
                  ? frenchFormatDateStringOrTimeStamp(employment.endDate)
                  : ""
              }
              titleProps={{
                component: getNextHeadingComponent(headingComponent)
              }}
              uppercaseTitle={false}
            />
          </Grid>
          {!hideBusiness && !!employment.business && (
            <Grid item xs={12}>
              <InfoItem
                name="Type d'activité"
                value={formatActivity(employment.business)}
                titleProps={{
                  component: getNextHeadingComponent(headingComponent)
                }}
                uppercaseTitle={false}
              />
            </Grid>
          )}
          {!!showAdminEmails && !!emailsCurrentAdminsDisplay && (
            <Grid item>
              <InfoItem
                name="Email(s) gestionnaire(s)"
                value={emailsCurrentAdminsDisplay}
                titleProps={{
                  component: getNextHeadingComponent(headingComponent)
                }}
                uppercaseTitle={false}
              />
              <Button
                priority="tertiary"
                onClick={() => {
                  navigator.clipboard
                    .writeText(emailsCurrentAdmins)
                    .then(() => {
                      alerts.success(
                        `Email(s) copiée(s) dans le presse-papiers !`,
                        "",
                        2000
                      );
                    });
                }}
              >
                copier les emails
              </Button>
            </Grid>
          )}
          {!hideRole && (
            <Grid item xs={12}>
              <InfoItem
                name="Rôle"
                value={
                  employment.hasAdminRights
                    ? EMPLOYMENT_ROLE.admin
                    : EMPLOYMENT_ROLE.employee
                }
                titleProps={{
                  component: getNextHeadingComponent(headingComponent)
                }}
                uppercaseTitle={false}
              />
            </Grid>
          )}
          {!hideActions && (
            <Grid item xs={12}>
              <ThirdPartyEmploymentAccess
                employmentId={employment.id}
                clients={employment.authorizedClients}
              />
            </Grid>
          )}
          {!hideActions && (
            <Grid item xs={12}>
              <HideEmail
                employment={employment}
                disabled={
                  status === EMPLOYMENT_STATUS.ended ||
                  status === EMPLOYMENT_STATUS.ceased
                }
              />
            </Grid>
          )}
        </Grid>

        {!hideStatus &&
          !hideActions &&
          (status === EMPLOYMENT_STATUS.ended ||
            status === EMPLOYMENT_STATUS.ceased) && (
            <Notice
              type="warning"
              description="L'entreprise a mis un terme à votre rattachement. Vous ne pouvez
            plus saisir de temps de travail pour cette entreprise."
            />
          )}
        {!hideStatus && !hideActions && status === EMPLOYMENT_STATUS.pending && (
          <>
            <Notice
              description="La validation du rattachement vous donnera le droit d'enregistrer
              du temps de travail pour cette entreprise."
            />
            <Grid
              className={classes.buttonContainer}
              container
              justifyContent="space-evenly"
              spacing={2}
            >
              <Grid item>
                <LoadingButton
                  onClick={async () => await handleEmploymentValidation(true)}
                >
                  Valider le rattachement
                </LoadingButton>
              </Grid>
              <Grid item>
                <LoadingButton
                  priority="secondary"
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
