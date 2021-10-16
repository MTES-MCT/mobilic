import Typography from "@material-ui/core/Typography";
import {
  checkMaximumDurationOfUninterruptedWork,
  checkMaximumDurationOfWork,
  checkMinimumDurationOfBreak,
  checkMinimumDurationOfWeeklyRest,
  isNightWork,
  RULE_RESPECT_STATUS
} from "common/utils/regulation";
import Chip from "@material-ui/core/Chip";
import { RegulationCheck } from "../pwa/components/RegulationCheck";
import {
  DAY,
  formatTimer,
  getStartOfWeek,
  LONG_BREAK_DURATION,
  WEEK
} from "common/utils/time";
import maxBy from "lodash/maxBy";
import React from "react";
import { splitByLongBreaksAndComputePeriodStats } from "../pwa/components/WorkTimeSummary";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { filterActivitiesOverlappingPeriod } from "common/utils/activities";

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

export function DayRegulationInfo({
  activitiesOverCurrentPastAndNextDay,
  weekActivities,
  dayStart
}) {
  const classes = useStyles();
  const dayEnd = dayStart + DAY;

  const statsOverCurrentPastAndNextDays = splitByLongBreaksAndComputePeriodStats(
    activitiesOverCurrentPastAndNextDay,
    dayStart - DAY,
    dayEnd + DAY
  );

  const onlyCurrentDayActivities = filterActivitiesOverlappingPeriod(
    activitiesOverCurrentPastAndNextDay,
    dayStart,
    dayEnd
  );

  const activityGroupsToTakeIntoAccount = statsOverCurrentPastAndNextDays.activityGroups.filter(
    ga => ga.startTime <= dayEnd && ga.endTime > dayStart
  );
  const hasActivityGroupOverlappingWithNextDay = activityGroupsToTakeIntoAccount.some(
    ga => ga.endTime > dayEnd
  );
  const hasActivityGroupOverlappingWithPreviousDay = activityGroupsToTakeIntoAccount.some(
    ga => ga.startTime < dayStart
  );

  const dailyRestRespected = activityGroupsToTakeIntoAccount
    .filter(group => group.endTime <= dayEnd)
    .every(
      group => group.endTime - group.startTime <= DAY - LONG_BREAK_DURATION
    );

  const checkBreakRespect = maxBy(
    activityGroupsToTakeIntoAccount.map(group =>
      checkMinimumDurationOfBreak(group.activities)
    ),
    r => r.status
  );

  let weekStats = null;
  let checkNumberOfWorkedDaysInWeek = null;
  if (new Date(dayStart * 1000).getDay() === 0) {
    const weekStart = getStartOfWeek(dayStart);
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

  return (
    <>
      {(hasActivityGroupOverlappingWithNextDay ||
        hasActivityGroupOverlappingWithPreviousDay) && (
        <Typography className={classes.infoText} variant="body2">
          Les seuils affichés intègrent en partie le temps de travail du jour{" "}
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
                  statsOverCurrentPastAndNextDays.innerLongBreaks.length > 0
                    ? `(${formatTimer(
                        statsOverCurrentPastAndNextDays.innerLongBreaks[0]
                          .duration
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
          checkBreakRespect &&
          checkBreakRespect.status === RULE_RESPECT_STATUS.failure
            ? {
                status: RULE_RESPECT_STATUS.failure,
                message: `Travail ininterrompu pendant plus de 6 heures !`
              }
            : checkMaximumDurationOfUninterruptedWork(onlyCurrentDayActivities)
        }
      />
      {weekStats &&
        checkNumberOfWorkedDaysInWeek.status ===
          RULE_RESPECT_STATUS.failure && (
          <RegulationCheck key={5} check={checkNumberOfWorkedDaysInWeek} />
        )}
    </>
  );
}
