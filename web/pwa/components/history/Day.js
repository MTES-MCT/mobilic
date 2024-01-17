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
import { SubmitterType } from "common/utils/regulation/alertTypes";
import {
  getAlertComputationVersion,
  getLatestAlertComputationVersion
} from "common/utils/regulation/alertVersions";
import { currentControllerId } from "common/utils/cookie";
import { prettyFormatDay } from "common/utils/time";

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
  regulationComputationsInPeriod,
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
  controlId = null
}) {
  const infoCardStyles = useInfoCardStyles();
  const classes = useStyles();
  const [
    regulationComputationToUse,
    setRegulationComputationToUse
  ] = React.useState([]);

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
  const missionsDeletedWarning =
    missionsDeleted.length === 1
      ? `La journée comporte une mission supprimée le ${prettyFormatDay(
          missionsDeleted[0].deletedAt,
          true
        )} par ${missionsDeleted[0].deletedBy}`
      : `La journée comporte plusieurs missions supprimées`;

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
      a => a.userId === userId && !a.isDeleted
    ),
    ...activitiesWithNextAndPreviousDay.filter(
      a =>
        !missionsInPeriod.map(m => m.id).includes(a.missionId) && !a.isDeleted
    )
  ];

  React.useEffect(() => {
    if (controlId) {
      if (
        !canDisplayContradictoryVersions ||
        contradictoryComputationError ||
        (hasComputedContradictory && contradictoryIsEmpty)
      ) {
        // No contradictory => use latest version
        setRegulationComputationToUse(
          getLatestAlertComputationVersion(regulationComputationsInPeriod)
        );
      } else if (shouldDisplayInitialEmployeeVersion) {
        setRegulationComputationToUse(
          getAlertComputationVersion(
            regulationComputationsInPeriod,
            SubmitterType.EMPLOYEE
          )
        );
      } else {
        setRegulationComputationToUse(
          getAlertComputationVersion(
            regulationComputationsInPeriod,
            SubmitterType.ADMIN
          )
        );
      }
    }
  }, [
    regulationComputationsInPeriod,
    canDisplayContradictoryVersions,
    hasComputedContradictory,
    contradictoryIsEmpty,
    contradictoryComputationError,
    shouldDisplayInitialEmployeeVersion
  ]);

  React.useEffect(() => {
    if (!canDisplayContradictoryVersions && shouldDisplayInitialEmployeeVersion)
      setShouldDisplayInitialEmployeeVersion(false);
  }, [canDisplayContradictoryVersions]);

  return (
    <Box>
      {missionsDeleted.length > 0 ? (
        <Alert severity="warning" sx={{ marginBottom: 2 }}>
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
          prefetchedRegulationComputation={
            currentControllerId() ? regulationComputationToUse : null
          }
          loading={loadingEmployeeVersion}
          userId={userId}
          shouldDisplayInitialEmployeeVersion={
            shouldDisplayInitialEmployeeVersion
          }
          missions={missionsInPeriod}
        />
      )}
      <InfoCard className={infoCardStyles.topMargin}>
        <MissionReviewSection
          title="Détail par mission"
          className="no-margin-no-padding"
        >
          <List>
            {missionsInPeriod.map(mission => (
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
                />
              </ListItem>
            ))}
          </List>
        </MissionReviewSection>
      </InfoCard>
    </Box>
  );
}
