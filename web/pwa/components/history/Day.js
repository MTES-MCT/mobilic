import React from "react";
import { filterActivitiesOverlappingPeriod } from "common/utils/activities";
import {
  DAY,
  formatTimer,
  getStartOfWeek,
  LONG_BREAK_DURATION,
  WEEK
} from "common/utils/time";
import {
  splitByLongBreaksAndComputePeriodStats,
  renderPeriodKpis,
  WorkTimeSummaryAdditionalInfo,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import {
  checkMaximumDurationOfUninterruptedWork,
  checkMaximumDurationOfWork,
  checkMinimumDurationOfBreak,
  checkMinimumDurationOfWeeklyRest,
  isNightWork,
  RULE_RESPECT_STATUS
} from "common/utils/regulation";
import maxBy from "lodash/maxBy";
import { RegulationCheck } from "../RegulationCheck";
import { MissionReviewSection } from "../MissionReviewSection";
import { ActivityList } from "../ActivityList";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { MissionDetails } from "../MissionDetails";
import { MissionSummary } from "./Mission";
import { ItalicWarningTypography } from "./ItalicWarningTypography";
import Chip from "@material-ui/core/Chip";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({
  chip: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: "#ff99cc",
    color: theme.palette.primary.contrastText
  },
  infoText: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.grey[500],
    fontStyle: "italic"
  }
}));

export function Day({
  missionsInPeriod,
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd,
  previousPeriodActivityEnd,
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
  const classes = useStyles();
  const lastMission = missionsInPeriod[missionsInPeriod.length - 1];

  const activities =
    activitiesWithNextAndPreviousDay.length > 0
      ? activitiesWithNextAndPreviousDay
      : missionsInPeriod.reduce(
          (acts, mission) => [...acts, ...mission.activities],
          []
        );

  const statsOverThreeDays = splitByLongBreaksAndComputePeriodStats(
    activities,
    selectedPeriodStart - DAY,
    selectedPeriodEnd + DAY
  );

  const dayActivities = filterActivitiesOverlappingPeriod(
    activities,
    selectedPeriodStart,
    selectedPeriodEnd
  );

  const activityGroupsToTakeIntoAccount = statsOverThreeDays.activityGroups.filter(
    ga => ga.startTime <= selectedPeriodEnd && ga.endTime > selectedPeriodStart
  );
  const hasActivityGroupOverlappingWithNextDay = activityGroupsToTakeIntoAccount.some(
    ga => ga.endTime > selectedPeriodEnd
  );
  const hasActivityGroupOverlappingWithPreviousDay = activityGroupsToTakeIntoAccount.some(
    ga => ga.startTime < selectedPeriodStart
  );

  let weekStats = null;
  let checkNumberOfWorkedDaysInWeek = null;
  if (new Date(selectedPeriodStart * 1000).getDay() === 0) {
    const weekStart = getStartOfWeek(selectedPeriodStart);
    weekStats = splitByLongBreaksAndComputePeriodStats(
      weekActivities,
      weekStart,
      weekStart + WEEK
    );
    checkNumberOfWorkedDaysInWeek = checkMinimumDurationOfWeeklyRest(
      weekStats.workedDays,
      weekStats.innerLongBreaks,
      weekStats.startTime,
      null
    );
  }

  const stats = splitByLongBreaksAndComputePeriodStats(
    activitiesWithNextAndPreviousDay,
    selectedPeriodStart,
    selectedPeriodEnd
  );

  const dailyRestRespected = activityGroupsToTakeIntoAccount
    .filter(group => group.endTime <= selectedPeriodEnd)
    .every(
      group => group.endTime - group.startTime <= DAY - LONG_BREAK_DURATION
    );

  const checkBreakRespect = maxBy(
    activityGroupsToTakeIntoAccount.map(group =>
      checkMinimumDurationOfBreak(group.activities)
    ),
    r => r.status
  );

  return (
    <div>
      <WorkTimeSummaryKpiGrid
        metrics={renderPeriodKpis(stats, true).filter(
          m => m.name !== "workedDays"
        )}
      />
      <WorkTimeSummaryAdditionalInfo>
        {lastMission.ended ? (
          <>
            {(hasActivityGroupOverlappingWithNextDay ||
              hasActivityGroupOverlappingWithPreviousDay) && (
              <Typography className={classes.infoText} variant="body2">
                Les seuils affichés intègrent en partie le temps de travail du
                jour{" "}
                {hasActivityGroupOverlappingWithPreviousDay &&
                hasActivityGroupOverlappingWithNextDay
                  ? "suivant et du jour précédent"
                  : hasActivityGroupOverlappingWithPreviousDay
                  ? "précédent"
                  : "suivant"}
                .
              </Typography>
            )}
            {activityGroupsToTakeIntoAccount.some(g =>
              g.activities.some(a => isNightWork(a))
            ) && <Chip className={classes.chip} label="Travail de nuit" />}
            <RegulationCheck
              key={0}
              check={
                dailyRestRespected
                  ? {
                      status: RULE_RESPECT_STATUS.success,
                      message: `Repos journalier respecté ${
                        statsOverThreeDays.innerLongBreaks.length > 0
                          ? `(${formatTimer(
                              statsOverThreeDays.innerLongBreaks[0].duration
                            )})`
                          : ""
                      } !`
                    }
                  : {
                      status: RULE_RESPECT_STATUS.failure,
                      message: `Repos journalier trop court !`
                    }
              }
            />
            <RegulationCheck
              key={2}
              check={maxBy(
                activityGroupsToTakeIntoAccount.map(group =>
                  checkMaximumDurationOfWork(group.activities)
                ),
                r => r.status
              )}
            />
            <RegulationCheck key={3} check={checkBreakRespect} />

            <RegulationCheck
              key={4}
              check={
                checkBreakRespect.status === RULE_RESPECT_STATUS.failure
                  ? {
                      status: RULE_RESPECT_STATUS.failure,
                      message: `Travail ininterrompu pendant plus de 6 heures !`
                    }
                  : checkMaximumDurationOfUninterruptedWork(dayActivities)
              }
            />
            {weekStats &&
              checkNumberOfWorkedDaysInWeek.status ===
                RULE_RESPECT_STATUS.failure && (
                <RegulationCheck
                  key={5}
                  check={checkNumberOfWorkedDaysInWeek}
                />
              )}
          </>
        ) : (
          <ItalicWarningTypography>Mission en cours !</ItalicWarningTypography>
        )}
      </WorkTimeSummaryAdditionalInfo>
      <WorkTimeSummaryAdditionalInfo>
        <MissionReviewSection
          title="Activités de la journée"
          className="no-margin-no-padding"
        >
          <ActivityList
            activities={dayActivities}
            fromTime={selectedPeriodStart}
            untilTime={selectedPeriodEnd}
            isMissionEnded={lastMission.ended}
          />
        </MissionReviewSection>
      </WorkTimeSummaryAdditionalInfo>
      <WorkTimeSummaryAdditionalInfo>
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
                <MissionSummary
                  mission={mission}
                  alternateDisplay
                  collapsable
                  defaultOpenCollapse={false}
                  showMetrics={false}
                >
                  <MissionDetails
                    inverseColors
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
                    fromTime={selectedPeriodStart}
                    untilTime={selectedPeriodEnd}
                    editKilometerReading={registerKilometerReading}
                  />
                </MissionSummary>
              </ListItem>
            ))}
          </List>
        </MissionReviewSection>
      </WorkTimeSummaryAdditionalInfo>
    </div>
  );
}
