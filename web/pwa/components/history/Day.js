import React from "react";
import { MissionReviewSection } from "../MissionReviewSection";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Mission } from "./Mission";
import Box from "@mui/material/Box";
import { DaySummary } from "./DaySummary";
import { useToggleContradictory } from "./toggleContradictory";
import { InfoCard } from "../../../common/InfoCard";
import { ContradictorySwitch } from "../ContradictorySwitch";
import { useCacheContradictoryInfoInPwaStore } from "common/utils/contradictory";
import { prettyFormatDay, textualPrettyFormatDay } from "common/utils/time";
import { getNextHeadingComponent } from "common/utils/html";
import { AlertsInHistory } from "../../../control/components/AlertsInHistory";
import Notice from "../../../common/Notice";
import { DayKpis } from "./DayKpis";
import { NoContradictory } from "./NoContradictory";
import { PeriodHeader } from "./PeriodHeader";
import { Stack } from "@mui/material";

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
    missionsInPeriod.map(m => [m, m.validation?.receptionTime]),
    useCacheContradictoryInfoInPwaStore(),
    controlId
  );

  const employeeVersionUserActivitiesToUse = React.useMemo(
    () =>
      employeeVersion?.activities
        ? [
            ...employeeVersion?.activities?.filter(
              a => a.userId === userId && !a.isMissionDeleted
            ),
            ...activitiesWithNextAndPreviousDay.filter(
              a =>
                !missionsInPeriod.map(m => m.id).includes(a.missionId) &&
                !a.isMissionDeleted
            )
          ]
        : undefined,
    [employeeVersion]
  );

  const adminVersionUserActivitiesToUse = React.useMemo(
    () => [
      ...adminVersion?.activities?.filter(
        a => a.userId === userId && !a.isMissionDeleted
      ),
      ...activitiesWithNextAndPreviousDay.filter(
        a =>
          !missionsInPeriod.map(m => m.id).includes(a.missionId) &&
          !a.isMissionDeleted
      )
    ],
    [adminVersion]
  );

  const userActivitiesToUse = React.useMemo(
    () =>
      shouldDisplayInitialEmployeeVersion
        ? employeeVersionUserActivitiesToUse
        : adminVersionUserActivitiesToUse,
    [employeeVersion, adminVersion, shouldDisplayInitialEmployeeVersion]
  );

  React.useEffect(() => {
    if (!canDisplayContradictoryVersions && shouldDisplayInitialEmployeeVersion)
      setShouldDisplayInitialEmployeeVersion(false);
  }, [canDisplayContradictoryVersions]);

  const missionsToDetail = React.useMemo(
    () => missionsInPeriod.filter(mission => !mission.isHoliday),
    [missionsInPeriod]
  );

  const contradictoryNotYetAvailable = !canDisplayContradictoryVersions;
  const emptyContradictory = hasComputedContradictory && contradictoryIsEmpty;

  const displayContradictory = !(
    contradictoryNotYetAvailable ||
    contradictoryComputationError ||
    emptyContradictory
  );
  return (
    <Box>
      <PeriodHeader
        title1="Journée du"
        title2={textualPrettyFormatDay(selectedPeriodStart)}
      >
        <DayKpis
          adminActivitiesWithNextAndPreviousDay={
            adminVersionUserActivitiesToUse
          }
          employeeActivitiesWithNextAndPreviousDay={
            employeeVersionUserActivitiesToUse
          }
          displayEmployee={shouldDisplayInitialEmployeeVersion}
          dayStart={selectedPeriodStart}
          loading={loadingEmployeeVersion}
          missions={missionsInPeriod}
        />
        {missionsDeleted.length > 0 ? (
          <Notice
            type="warning"
            sx={{ marginBottom: 2 }}
            description={missionsDeletedWarning}
          />
        ) : (
          displayContradictory && (
            <ContradictorySwitch
              disabled={loadingEmployeeVersion}
              shouldDisplayInitialEmployeeVersion={
                shouldDisplayInitialEmployeeVersion
              }
              setShouldDisplayInitialEmployeeVersion={
                setShouldDisplayInitialEmployeeVersion
              }
            />
          )
        )}
      </PeriodHeader>
      {!displayContradictory && (
        <NoContradictory
          contradictoryNotYetAvailable={contradictoryNotYetAvailable}
          contradictoryComputationError={contradictoryComputationError}
        />
      )}

      <Stack direction="column" px={2} pt={2} rowGap={2}>
        {alertsInPeriod && alertsInPeriod.length > 0 && (
          <AlertsInHistory alertsInPeriod={alertsInPeriod} />
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
          <InfoCard elevation={0}>
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
                      headingComponent={getNextHeadingComponent(
                        headingComponent
                      )}
                    />
                  </ListItem>
                ))}
              </List>
            </MissionReviewSection>
          </InfoCard>
        )}
      </Stack>
    </Box>
  );
}
