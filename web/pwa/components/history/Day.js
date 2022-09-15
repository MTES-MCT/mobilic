import React from "react";
import { MissionReviewSection } from "../MissionReviewSection";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Mission } from "./Mission";
import { Box } from "@mui/material";
import { DaySummary } from "./DaySummary";
import { useToggleContradictory } from "./toggleContradictory";
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { ContradictorySwitch } from "../ContradictorySwitch";
import { makeStyles } from "@mui/styles";
import { useCacheContradictoryInfoInPwaStore } from "common/utils/contradictory";

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
  weekActivities,
  controlId = null
}) {
  const infoCardStyles = useInfoCardStyles();
  const classes = useStyles();

  const [
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion
  ] = React.useState(false);
  const canDisplayContradictoryVersions = missionsInPeriod.every(
    mission => mission.adminValidation && mission.validation
  );

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
    ...missionResourcesToUse.activities.filter(a => a.userId === userId),
    ...activitiesWithNextAndPreviousDay.filter(
      a => !missionsInPeriod.map(m => m.id).includes(a.missionId)
    )
  ];

  React.useEffect(() => {
    if (!canDisplayContradictoryVersions && shouldDisplayInitialEmployeeVersion)
      setShouldDisplayInitialEmployeeVersion(false);
  }, [canDisplayContradictoryVersions]);

  return (
    <Box>
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
      <DaySummary
        activitiesWithNextAndPreviousDay={userActivitiesToUse}
        isDayEnded={true}
        dayStart={selectedPeriodStart}
        weekActivities={weekActivities}
        loading={loadingEmployeeVersion}
      />
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
                  defaultOpenCollapse={false}
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
