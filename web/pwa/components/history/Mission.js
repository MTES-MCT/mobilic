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
import { prettyFormatDay } from "common/utils/time";
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

const useStyles = makeStyles(theme => ({
  alternateCard: {
    backgroundColor: theme.palette.background.default
  },
  darkCard: {
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.primary.contrastText
  },
  contradictorySwitch: {
    marginBottom: ({ showMetrics }) => (showMetrics ? theme.spacing(1) : 0),
    paddingRight: ({ showMetrics }) => (showMetrics ? 0 : theme.spacing(2)),
    paddingLeft: ({ showMetrics }) => (showMetrics ? 0 : theme.spacing(2))
  },
  buttonContainer: {
    display: "flex",
    flexWrap: "nowrap",
    flexShrink: 0
  },
  employeeValidation: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
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
  controlId = null
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
    mission.adminValidation && mission.validation;

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

  const [
    missionResourcesToUse,
    // eslint-disable-next-line no-unused-vars
    _,
    loadingEmployeeVersion,
    hasComputedContradictory,
    contradictoryIsEmpty,
    contradictoryComputationError
  ] = useToggleContradictory(
    canDisplayContradictoryVersions,
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion,
    [[mission, mission.validation?.receptionTime]],
    useCacheContradictoryInfoInPwaStore(),
    controlId
  );

  const userActivitiesToUse = missionResourcesToUse.activities.filter(
    a => a.userId === userId
  );
  const userExpendituresToUse = missionResourcesToUse.expenditures.filter(
    a => a.userId === userId
  );

  const classes = useStyles({ showMetrics });
  const infoCardStyles = useInfoCardStyles();

  const kpis = computeTimesAndDurationsFromActivities(userActivitiesToUse);
  const actualDay = mission?.startTime;

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
    />
  );

  return (
    <>
      <InfoCard
        className={`${alternateDisplay ? classes.darkCard : ""} ${
          infoCardStyles.bottomMargin
        }`}
        textAlign="left"
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
            <Typography className="bold">
              {mission.name
                ? `Nom de la mission : ${mission.name}`
                : `Mission du ${prettyFormatDay(actualDay)}`}
            </Typography>
          </Grid>
          <Grid item className={classes.buttonContainer}>
            <IconButton
              color={alternateDisplay ? "inherit" : "primary"}
              className="no-margin-no-padding"
              style={{ marginRight: 16 }}
              onClick={async e => {
                e.stopPropagation();
                e.preventDefault();
                trackLink({
                  href: `/generate_mission_export`,
                  linkType: "download"
                });
                try {
                  if (controlId) {
                    await api.downloadFileHttpQuery(
                      HTTP_QUERIES.missionControlExport,
                      {
                        json: { mission_id: mission.id, control_id: controlId }
                      }
                    );
                  } else {
                    await api.downloadFileHttpQuery(
                      HTTP_QUERIES.missionExport,
                      {
                        json: { mission_id: mission.id, user_id: userId }
                      }
                    );
                  }
                } catch (err) {
                  alerts.error(
                    formatApiError(err),
                    "generate_mission_export",
                    6000
                  );
                }
              }}
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
      <Collapse in={open || !collapsable}>
        {!mission.ended && (
          <InfoCard
            {...(alternateDisplay
              ? {
                  elevation: 0,
                  className: `${classes.alternateCard} ${infoCardStyles.bottomMargin}`
                }
              : { className: infoCardStyles.bottomMargin })}
          >
            <ItalicWarningTypography>
              Mission en cours !
            </ItalicWarningTypography>
          </InfoCard>
        )}
        {(!validateMission ||
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
        <ContradictorySwitch
          contradictoryNotYetAvailable={!canDisplayContradictoryVersions}
          emptyContradictory={contradictoryIsEmpty && hasComputedContradictory}
          className={classes.contradictorySwitch}
          shouldDisplayInitialEmployeeVersion={
            shouldDisplayInitialEmployeeVersion
          }
          setShouldDisplayInitialEmployeeVersion={
            setShouldDisplayInitialEmployeeVersion
          }
          contradictoryComputationError={contradictoryComputationError}
          disabled={loadingEmployeeVersion}
        />
        {showMetrics && (
          <WorkTimeSummaryKpiGrid
            loading={loadingEmployeeVersion}
            metrics={renderMissionKpis(kpis, "Durée", true)}
            cardProps={
              alternateDisplay
                ? { elevation: 0, className: classes.alternateCard }
                : {}
            }
          />
        )}
        {showMetrics ? (
          <InfoCard
            className={infoCardStyles.topMargin}
            loading={loadingEmployeeVersion}
            px={0}
            py={0}
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
