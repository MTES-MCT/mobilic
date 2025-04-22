import React from "react";
import {
  computeTimesAndDurationsFromActivities,
  renderMissionKpis,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { MissionDetails } from "../MissionDetails";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { makeStyles } from "@mui/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { ItalicWarningTypography } from "./ItalicWarningTypography";
import {
  prettyFormatDay,
  frenchFormatDateStringOrTimeStamp,
  unixTimestampToDate
} from "common/utils/time";
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { useToggleContradictory } from "./toggleContradictory";
import { ContradictorySwitch } from "../ContradictorySwitch";
import { useCacheContradictoryInfoInPwaStore } from "common/utils/contradictory";
import GetAppIcon from "@mui/icons-material/GetApp";
import Grid from "@mui/material/Grid";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useApi } from "common/utils/api";
import { MissionValidationInfo } from "../../../common/MissionValidationInfo";
import {
  getNextHeadingComponent,
  getPrevHeadingComponent
} from "common/utils/html";
import { NoContradictory } from "./NoContradictory";
import { PeriodHeader } from "./PeriodHeader";
import { Box, Stack } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  alternateCard: {
    backgroundColor: theme.palette.background.default
  },
  darkCard: {
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.primary.contrastText
  },
  buttonContainer: {
    display: "flex",
    flexWrap: "nowrap",
    flexShrink: 0
  },
  employeeValidation: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  missionName: {
    fontWeight: 700,
    fontSize: "1.25rem",
    color: "white"
  },
  missionDate: {
    fontWeight: 400,
    fontSize: "1rem",
    color: "white"
  },
  downloadButton: {
    color: "white",
    boxShadow: "inset 0 0 0 1px white",
    "&:hover": {
      color: fr.colors.decisions.text.actionHigh.blueFrance.default,
      boxShadow: "inset 0 0 0 1px var(--border-action-high-blue-france)"
    },
    flexShrink: 0
  }
}));

export function Mission({
  mission,
  alternateDisplay = false,
  collapsable = false,
  defaultOpenCollapse = false,
  showMetrics = true,
  editActivityEvent,
  createActivity,
  editExpenditures,
  editVehicle,
  currentMission,
  validateMission,
  logComment,
  cancelComment,
  coworkers,
  vehicles,
  userId,
  fromTime,
  untilTime,
  registerKilometerReading,
  controlledShouldDisplayInitialEmployeeVersion = false,
  controlId = null,
  headingComponent
}) {
  const [open, setOpen] = React.useState(defaultOpenCollapse);
  const [
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion
  ] = React.useState(false);

  const api = useApi();
  const { trackLink } = useMatomo();
  const alerts = useSnackbarAlerts();

  const canDisplayContradictoryVersions =
    (mission.adminValidation && mission.validation) ||
    (mission.isDeleted && mission.complete);

  React.useEffect(() => {
    if (
      shouldDisplayInitialEmployeeVersion !==
        controlledShouldDisplayInitialEmployeeVersion &&
      canDisplayContradictoryVersions
    )
      setShouldDisplayInitialEmployeeVersion(
        controlledShouldDisplayInitialEmployeeVersion
      );
  }, [controlledShouldDisplayInitialEmployeeVersion]);

  const {
    employeeVersion,
    adminVersion,
    isComputingContradictory: loadingEmployeeVersion,
    hasComputedContradictory,
    contradictoryIsEmpty,
    contradictoryComputationError
  } = useToggleContradictory(
    canDisplayContradictoryVersions,
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion,
    [[mission, mission.validation?.receptionTime]],
    useCacheContradictoryInfoInPwaStore(),
    controlId
  );

  const employeeVersionUserActivitiesToUse = React.useMemo(
    () => employeeVersion?.activities?.filter(a => a.userId === userId),
    [employeeVersion]
  );

  const adminVersionUserActivitiesToUse = React.useMemo(
    () => adminVersion?.activities?.filter(a => a.userId === userId),
    [adminVersion]
  );

  const userActivitiesToUse = React.useMemo(
    () =>
      shouldDisplayInitialEmployeeVersion
        ? employeeVersionUserActivitiesToUse
        : adminVersionUserActivitiesToUse,
    [
      shouldDisplayInitialEmployeeVersion,
      adminVersionUserActivitiesToUse,
      employeeVersionUserActivitiesToUse
    ]
  );

  const userExpendituresToUse = React.useMemo(
    () =>
      (shouldDisplayInitialEmployeeVersion
        ? employeeVersion
        : adminVersion
      ).expenditures.filter(a => a.userId === userId),
    [shouldDisplayInitialEmployeeVersion, adminVersion, employeeVersion]
  );

  const classes = useStyles({ showMetrics });
  const infoCardStyles = useInfoCardStyles();

  const adminKpis =
    adminVersionUserActivitiesToUse &&
    computeTimesAndDurationsFromActivities(adminVersionUserActivitiesToUse);
  const employeeKpis =
    employeeVersionUserActivitiesToUse &&
    computeTimesAndDurationsFromActivities(employeeVersionUserActivitiesToUse);

  const actualDay = mission?.startTime;

  const onDownloadMission = async e => {
    e.stopPropagation();
    e.preventDefault();
    trackLink({
      href: `/generate_mission_export`,
      linkType: "download"
    });
    try {
      if (controlId) {
        await api.downloadFileHttpQuery(HTTP_QUERIES.missionControlExport, {
          json: { mission_id: mission.id, control_id: controlId }
        });
      } else {
        await api.downloadFileHttpQuery(HTTP_QUERIES.missionExport, {
          json: { mission_id: mission.id, user_id: userId }
        });
      }
    } catch (err) {
      alerts.error(formatApiError(err), "generate_mission_export", 6000);
    }
  };

  const MissionDetailsComponent = (
    <MissionDetails
      inverseColors
      activities={userActivitiesToUse}
      expenditures={userExpendituresToUse}
      mission={mission}
      editActivityEvent={editActivityEvent}
      createActivity={createActivity}
      editExpenditures={editExpenditures}
      editVehicle={
        editVehicle ? vehicle => editVehicle({ mission, vehicle }) : null
      }
      nullableEndTimeInEditActivity={
        currentMission ? mission.id === currentMission.id : true
      }
      hideValidations={!mission.ended}
      validateMission={validateMission}
      validationButtonName="Valider"
      logComment={logComment}
      cancelComment={cancelComment}
      coworkers={coworkers}
      vehicles={vehicles}
      userId={userId}
      fromTime={fromTime}
      untilTime={untilTime}
      editKilometerReading={registerKilometerReading}
      controlId={controlId}
      titleProps={{
        component:
          headingComponent && collapsable
            ? getNextHeadingComponent(headingComponent)
            : headingComponent
      }}
    />
  );

  const contradictoryNotYetAvailable = !canDisplayContradictoryVersions;
  const emptyContradictory = hasComputedContradictory && contradictoryIsEmpty;

  const displayContradictory = !(
    contradictoryNotYetAvailable ||
    contradictoryComputationError ||
    emptyContradictory
  );

  return (
    <>
      {collapsable && (
        <InfoCard
          className={`${alternateDisplay ? classes.darkCard : ""} ${
            infoCardStyles.bottomMargin
          }`}
          textAlign="left"
          elevation={0}
        >
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            wrap="nowrap"
            onClick={() => setOpen(!open)}
          >
            <Grid item>
              <Typography
                component={getPrevHeadingComponent(headingComponent)}
                sx={{ color: "inherit" }}
              >
                <span className="bold">
                  {mission.name
                    ? `Nom de la mission : ${mission.name}`
                    : `Mission du ${prettyFormatDay(actualDay)}`}
                </span>
                {mission.isDeleted
                  ? ` (mission supprimée le ${frenchFormatDateStringOrTimeStamp(
                      unixTimestampToDate(mission?.deletedAt)
                    )} par ${mission?.deletedBy})`
                  : ""}
              </Typography>
            </Grid>
            <Grid item className={classes.buttonContainer}>
              <IconButton
                color={alternateDisplay ? "inherit" : "primary"}
                className="no-margin-no-padding"
                style={{ marginRight: 16 }}
                onClick={onDownloadMission}
              >
                <GetAppIcon />
              </IconButton>
              {collapsable && (
                <IconButton
                  aria-label={open ? "Masquer" : "Afficher"}
                  color="inherit"
                  className="no-margin-no-padding"
                >
                  {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Grid>
          </Grid>
        </InfoCard>
      )}
      <Collapse in={open || !collapsable}>
        {!mission.ended && !mission.isDeleted && (
          <InfoCard
            {...(alternateDisplay
              ? {
                  className: `${classes.alternateCard} ${infoCardStyles.bottomMargin}`
                }
              : { className: infoCardStyles.bottomMargin })}
            elevation={0}
          >
            <ItalicWarningTypography>
              Mission en cours !
            </ItalicWarningTypography>
          </InfoCard>
        )}
        {!(mission.isDeleted && !mission.complete) &&
          (!validateMission ||
            mission.validation ||
            mission.adminValidation) && (
            <>
              <MissionValidationInfo validation={mission.validation} />
              <MissionValidationInfo
                className={classes.employeeValidation}
                validation={mission.adminValidation}
                isAdmin
              />
            </>
          )}
        <PeriodHeader>
          <Stack direction="row" justifyContent="space-between">
            <Box sx={{ textAlign: "left" }}>
              <Typography className={classes.missionName}>
                Mission {mission.name}
              </Typography>
              <Typography className={classes.missionDate}>
                {prettyFormatDay(mission.startTime, true)}
              </Typography>
            </Box>
            <Button
              iconId="fr-icon-download-line"
              priority="secondary"
              onClick={onDownloadMission}
              title="Télécharger la mission"
              className={classes.downloadButton}
              size="small"
            />
          </Stack>
          {showMetrics && (
            <WorkTimeSummaryKpiGrid
              loading={loadingEmployeeVersion}
              metrics={renderMissionKpis(
                adminKpis,
                employeeKpis,
                shouldDisplayInitialEmployeeVersion,
                "Durée",
                true
              )}
              cardProps={
                alternateDisplay
                  ? { elevation: 0, className: classes.alternateCard }
                  : {}
              }
            />
          )}
          {!mission.isDeleted && displayContradictory && (
            <ContradictorySwitch
              shouldDisplayInitialEmployeeVersion={
                shouldDisplayInitialEmployeeVersion
              }
              setShouldDisplayInitialEmployeeVersion={
                setShouldDisplayInitialEmployeeVersion
              }
              disabled={loadingEmployeeVersion}
            />
          )}
        </PeriodHeader>
        {!displayContradictory && (
          <NoContradictory
            contradictoryNotYetAvailable={contradictoryNotYetAvailable}
            contradictoryComputationError={contradictoryComputationError}
          />
        )}
        {showMetrics ? (
          <InfoCard
            className={infoCardStyles.topMargin}
            loading={loadingEmployeeVersion}
            px={0}
            py={0}
            elevation={0}
          >
            {MissionDetailsComponent}
          </InfoCard>
        ) : (
          MissionDetailsComponent
        )}
      </Collapse>
    </>
  );
}
