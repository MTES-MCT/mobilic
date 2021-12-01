import React from "react";
import {
  computeTimesAndDurationsFromActivities,
  renderMissionKpis,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { MissionDetails } from "../MissionDetails";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse/Collapse";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { ItalicWarningTypography } from "./ItalicWarningTypography";
import { prettyFormatDay } from "common/utils/time";
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { useToggleContradictory } from "./toggleContradictory";
import { ContradictorySwitch } from "../ContradictorySwitch";
import { useCacheContradictoryInfoInPwaStore } from "common/utils/contradictory";
import GetAppIcon from "@material-ui/icons/GetApp";
import Grid from "@material-ui/core/Grid";

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
  controlledShouldDisplayInitialEmployeeVersion = false
}) {
  const [open, setOpen] = React.useState(defaultOpenCollapse);
  const [
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion
  ] = React.useState(false);

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
    contradictoryIsEmpty
  ] = useToggleContradictory(
    canDisplayContradictoryVersions,
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion,
    [[mission, mission.validation?.receptionTime]],
    useCacheContradictoryInfoInPwaStore()
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
      editVehicle={vehicle => editVehicle({ mission, vehicle })}
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
          justify="space-between"
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
              onClick={e => {
                e.stopPropagation();
                console.log("Downloading mission");
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
