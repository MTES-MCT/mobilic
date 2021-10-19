import React from "react";
import { MissionReviewSection } from "../MissionReviewSection";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { Mission } from "./Mission";
import { Box } from "@material-ui/core";
import { DaySummary } from "./DaySummary";
import { useToggleContradictory } from "./toggleContradictory";
import { InfoCard, useInfoCardStyles } from "../InfoCard";
import { ContradictorySwitch } from "../ContradictorySwitch";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
  weekActivities
}) {
  const infoCardStyles = useInfoCardStyles();
  const classes = useStyles();

  const [
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion
  ] = React.useState(false);
  const shouldDisplayContradictoryVersionsToggle = missionsInPeriod.every(
    mission => mission.adminValidation && mission.validation
  );

  // eslint-disable-next-line no-unused-vars
  const [activitiesToUse, _, loadingEmployeeVersion] = useToggleContradictory(
    shouldDisplayInitialEmployeeVersion,
    setShouldDisplayInitialEmployeeVersion,
    missionsInPeriod,
    activitiesWithNextAndPreviousDay
  );

  React.useEffect(() => {
    if (
      !shouldDisplayContradictoryVersionsToggle &&
      shouldDisplayInitialEmployeeVersion
    )
      setShouldDisplayInitialEmployeeVersion(false);
  }, [shouldDisplayContradictoryVersionsToggle]);

  return (
    <Box>
      {shouldDisplayContradictoryVersionsToggle && (
        <ContradictorySwitch
          className={classes.contradictorySwitch}
          shouldDisplayInitialEmployeeVersion={
            shouldDisplayInitialEmployeeVersion
          }
          setShouldDisplayInitialEmployeeVersion={
            setShouldDisplayInitialEmployeeVersion
          }
        />
      )}
      <DaySummary
        activitiesWithNextAndPreviousDay={activitiesToUse.filter(
          a => a.userId === userId
        )}
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
                />
              </ListItem>
            ))}
          </List>
        </MissionReviewSection>
      </InfoCard>
    </Box>
  );
}
