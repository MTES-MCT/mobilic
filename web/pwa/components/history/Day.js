import React from "react";
import { MissionReviewSection } from "../MissionReviewSection";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Mission } from "./Mission";
import { Alert, Box, Typography } from "@mui/material";
import { DaySummary } from "./DaySummary";
import { useToggleContradictory } from "./toggleContradictory";
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { ContradictorySwitch } from "../ContradictorySwitch";
import { makeStyles } from "@mui/styles";
import { useCacheContradictoryInfoInPwaStore } from "common/utils/contradictory";
import { prettyFormatDay } from "common/utils/time";
import { getNextHeadingComponent } from "common/utils/html";
import { AlertsInHistory } from "../../../control/components/AlertsInHistory";

export const useStyles = makeStyles(theme => ({
  contradictorySwitch: {
    marginBottom: theme.spacing(1)
  }
}));

export function Day({
  missionsInPeriod,
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd,
  editActivityEvent,
  createActivity,
  editExpenditures,
  editVehicle,
  currentMission,
  validateMission,
  logComment,
  cancelComment,
  registerKilometerReading,
  coworkers,
  vehicles,
  userId,
  controlId = null,
  headingComponent,
  alertsInPeriod = null
}) {
  const infoCardStyles = useInfoCardStyles();
  const classes = useStyles();

  const [
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion
  ] = React.useState(false);

  const canDisplayContradictoryVersions = missionsInPeriod.every(
    mission =>
      (mission.adminValidation && mission.validation) || mission.isDeleted
  );

  const missionsDeleted = React.useMemo(
    () => missionsInPeriod.filter(mission => mission.isDeleted),
    [missionsInPeriod]
  );

  const missionsDeletedWarning = React.useMemo(() => {
    if (missionsDeleted.length === 1) {
      const missionDeleted = missionsDeleted[0];
      return `La journée comporte une ${
        missionDeleted.isHoliday
          ? "absence de type " + missionDeleted.name.toLowerCase()
          : "mission"
      } supprimée le ${prettyFormatDay(missionDeleted.deletedAt, true)} par ${
        missionDeleted.deletedBy
      }.`;
    } else {
      return `La journée comporte plusieurs missions et/ou absences supprimées.`;
    }
  }, [missionsDeleted]);

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
    missionsInPeriod.map(m => [m, m.validation?.receptionTime]),
    useCacheContradictoryInfoInPwaStore(),
    controlId
  );

  const userActivitiesToUse = [
    ...missionResourcesToUse.activities.filter(
      a => a.userId === userId && !a.isMissionDeleted
    ),
    ...activitiesWithNextAndPreviousDay.filter(
      a =>
        !missionsInPeriod.map(m => m.id).includes(a.missionId) &&
        !a.isMissionDeleted
    )
  ];

  React.useEffect(() => {
    if (!canDisplayContradictoryVersions && shouldDisplayInitialEmployeeVersion)
      setShouldDisplayInitialEmployeeVersion(false);
  }, [canDisplayContradictoryVersions]);

  const missionsToDetail = React.useMemo(
    () => missionsInPeriod.filter(mission => !mission.isHoliday),
    [missionsInPeriod]
  );
  return (
    <Box>
      {alertsInPeriod && alertsInPeriod.length > 0 && (
        <AlertsInHistory alertsInPeriod={alertsInPeriod} />
      )}
      {missionsDeleted.length > 0 ? (
        <Alert severity="warning" sx={{ marginBottom: 2, textAlign: "left" }}>
          <Typography>{missionsDeletedWarning}</Typography>
        </Alert>
      ) : (
        <ContradictorySwitch
          contradictoryNotYetAvailable={!canDisplayContradictoryVersions}
          disabled={loadingEmployeeVersion}
          emptyContradictory={hasComputedContradictory && contradictoryIsEmpty}
          className={classes.contradictorySwitch}
          shouldDisplayInitialEmployeeVersion={
            shouldDisplayInitialEmployeeVersion
          }
          setShouldDisplayInitialEmployeeVersion={
            setShouldDisplayInitialEmployeeVersion
          }
          contradictoryComputationError={contradictoryComputationError}
        />
      )}

      {missionsInPeriod.length !== missionsDeleted.length && (
        <DaySummary
          activitiesWithNextAndPreviousDay={userActivitiesToUse}
          isDayEnded={true}
          dayStart={selectedPeriodStart}
          loading={loadingEmployeeVersion}
          userId={userId}
          shouldDisplayInitialEmployeeVersion={
            shouldDisplayInitialEmployeeVersion
          }
          missions={missionsInPeriod}
          controlId={controlId}
        />
      )}
      {missionsToDetail.length > 0 && (
        <InfoCard className={infoCardStyles.topMargin}>
          <MissionReviewSection
            title="Détail par mission"
            className="no-margin-no-padding"
            titleProps={{ component: headingComponent }}
          >
            <List>
              {missionsToDetail.map(mission => (
                <ListItem
                  key={mission.id}
                  style={{
                    display: "block",
                    paddingLeft: 0,
                    paddingRight: 0
                  }}
                >
                  <Mission
                    mission={mission}
                    currentMission={currentMission}
                    alternateDisplay
                    collapsable
                    defaultOpenCollapse={
                      missionsInPeriod.length === 1 &&
                      missionsDeleted.length === 1
                    }
                    showMetrics={false}
                    editActivityEvent={editActivityEvent}
                    createActivity={createActivity}
                    editExpenditures={editExpenditures}
                    editVehicle={editVehicle}
                    validateMission={validateMission}
                    logComment={logComment}
                    cancelComment={cancelComment}
                    coworkers={coworkers}
                    vehicles={vehicles}
                    userId={userId}
                    fromTime={selectedPeriodStart}
                    untilTime={selectedPeriodEnd}
                    registerKilometerReading={registerKilometerReading}
                    controlledShouldDisplayInitialEmployeeVersion={
                      shouldDisplayInitialEmployeeVersion
                    }
                    controlId={controlId}
                    headingComponent={getNextHeadingComponent(headingComponent)}
                  />
                </ListItem>
              ))}
            </List>
          </MissionReviewSection>
        </InfoCard>
      )}
    </Box>
  );
}
