import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { ActivityHistorySection } from "./ActivityHistorySection";
import {
  ACTIVITIES,
  ACTIVITIES_OPERATIONS,
  addBreaksToActivityList,
  computeDurationAndTime,
  filterActivitiesOverlappingPeriod,
  getActivityLabelDependingOnMissionType
} from "common/utils/activities";
import {
  formatTimerWithMinSuffix,
  formatTimeOfDay,
  LONG_BREAK_DURATION,
  now,
  useDateTimeFormatter
} from "common/utils/time";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useModals } from "common/utils/modals";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import { Description } from "../../common/typography/Description";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { Box } from "@mui/material";

const useStyles = makeStyles(theme => ({
  longBreak: {
    "& *": {
      color: `${theme.palette.success.main} !important`
    },
    color: `${theme.palette.success.main} !important`
  },
  activityCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "8px 0",
    background: fr.colors.decisions.background.alt.blueFrance.default,
    marginBottom: theme.spacing(1),
    "&:last-child": {
      marginBottom: 0
    }
  },
  activityCardDismissed: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "8px 0",
    background: fr.colors.decisions.background.alt.grey.default,
    marginBottom: 8,
    "&:last-child": {
      marginBottom: 0
    }
  },
  dismissedAvatar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: fr.colors.decisions.background.disabled.grey.default,
    color: fr.colors.decisions.background.default.grey.default,
    width: 44,
    height: 44,
    borderRadius: "50%",
    flexShrink: 0
  },
  dismissedText: {
    "& *": {
      color: `${fr.colors.decisions.text.disabled.grey.default} !important`
    },
    color: `${fr.colors.decisions.text.disabled.grey.default} !important`
  },
  activityRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "8px 12px 8px 16px",
    gap: 12,
    width: "100%"
  },
  avatar: props => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: props.color,
    color: fr.colors.decisions.background.default.grey.default,
    width: 44,
    height: 44,
    borderRadius: "50%",
    flexShrink: 0
  }),
  avatarIcon: {
    width: 28,
    height: 28
  },
  activityInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    flexGrow: 1,
    minWidth: 0
  },
  activityName: {
    fontWeight: 500,
    fontSize: 16,
    lineHeight: "24px",
    color: fr.colors.decisions.text.title.grey.default
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap"
  },
  durationGroup: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0
  },
  durationIcon: {
    "&::before": {
      "--icon-size": "14px"
    },
    color: fr.colors.decisions.text.active.blueFrance.default
  },
  duration: {
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.text.active.blueFrance.default,
    marginLeft: 2,
    marginRight: 4
  },
  horaires: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.text.mention.grey.default
  },
  strikethrough: {
    textDecoration: "line-through"
  },
  editButtonWrapper: {
    flexShrink: 0,
    marginLeft: "auto"
  },
  activityListContainer: {
    marginTop: theme.spacing(2)
  },
  switch: {
    "& .MuiSwitch-thumb": {
      color: theme.palette.secondary.main
    },
    "& .MuiSwitch-track": {
      backgroundColor: theme.palette.secondary.main
    }
  }
}));

function ActivityItem({
  activity,
  editActivityEvent,
  createActivity,
  allMissionActivities,
  previousMissionEnd,
  teamChanges,
  nullableEndTimeInEditActivity,
  allowTeamMode,
  allowSupportActivity = false,
  datetimeFormatter = formatTimeOfDay,
  activityEvents = [],
  shouldDisplayInitialEmployeeVersion = false,
  employeeValidationTime = null,
  onDispute = null,
  onCancelDispute = null
}) {
  const modals = useModals();
  const classes = useStyles({ color: ACTIVITIES[activity.type].color });

  const isDismissed = !!activity.dismissedAt;
  const isBreak = activity.type === ACTIVITIES.break.name;
  const isLongBreak =
    isBreak && activity.duration && activity.duration >= LONG_BREAK_DURATION;

  const activityLabel = getActivityLabelDependingOnMissionType(
    activity.type,
    allowSupportActivity
  );

  return (
    <div className={isDismissed ? classes.activityCardDismissed : classes.activityCard}>
      <div className={classes.activityRow}>
        <div className={isDismissed ? classes.dismissedAvatar : classes.avatar}>
          {ACTIVITIES[activity.type].renderIcon({ className: classes.avatarIcon })}
        </div>
        <div className={`${classes.activityInfo} ${isDismissed ? classes.dismissedText : ""} ${isLongBreak ? classes.longBreak : ""}`}>
          <span className={isLongBreak ? "" : classes.activityName}>
            {isLongBreak
              ? "Repos journalier"
              : `${activityLabel}${
                  activity.isMissionDeleted ? " (activité supprimée)" : ""
                }`}
          </span>
          <span className={`${classes.infoRow} ${activity.operation?.type === ACTIVITIES_OPERATIONS.update ? classes.strikethrough : ""}`}>
            <span className={classes.durationGroup}>
              <span className={`fr-icon--sm fr-icon-time-line ${classes.durationIcon}`} aria-hidden="true" />
              <span className={classes.duration}>
                {activity.displayedEndTime
                  ? formatTimerWithMinSuffix(activity.duration)
                  : "En cours"}
              </span>
            </span>
            {activity.displayedEndTime && (
              <span className={classes.horaires}>
                {`${datetimeFormatter(activity.displayedStartTime)} - ${datetimeFormatter(activity.displayedEndTime)}`}
              </span>
            )}
          </span>
          {activity.operation?.type === ACTIVITIES_OPERATIONS.update && (
            <span className={classes.infoRow}>
              <span className={`fr-icon--sm fr-icon-time-line ${classes.durationIcon}`} aria-hidden="true" />
              <span className={classes.duration}>
                {activity.operation.endTime
                  ? formatTimerWithMinSuffix(activity.operation.endTime - activity.operation.startTime)
                  : "En cours"}
              </span>
              {activity.operation.endTime && (
                <span className={classes.horaires}>
                  {`${datetimeFormatter(activity.operation.startTime)} - ${datetimeFormatter(activity.operation.endTime)}`}
                </span>
              )}
            </span>
          )}
        </div>
        {editActivityEvent && (
          <div className={classes.editButtonWrapper}>
          <Button
            size="small"
            priority="tertiary no outline"
            onClick={() =>
              modals.open("activityRevision", {
                event: activity,
                otherActivities: isBreak
                  ? allMissionActivities
                  : allMissionActivities.filter(
                      a => a.startTime !== activity.startTime
                    ),
                handleRevisionAction: (
                  activity,
                  actionType,
                  newUserStartTime,
                  newUserEndTime,
                  userComment,
                  forAllTeam
                ) =>
                  editActivityEvent(
                    activity,
                    actionType,
                    newUserStartTime,
                    newUserEndTime,
                    userComment,
                    forAllTeam
                  ),
                createActivity,
                previousMissionEnd,
                cancellable: true,
                teamChanges,
                allowTeamMode,
                nullableEndTime: nullableEndTimeInEditActivity,
                allowSupportActivity
              })
            }
          >
            Modifier
          </Button>
          </div>
        )}
      </div>
      {activityEvents.length > 0 && (
        <ActivityHistorySection
          activityEvents={activityEvents}
          shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
          validationTime={employeeValidationTime}
          activity={activity}
          onDispute={onDispute}
          onCancelDispute={onCancelDispute}
        />
      )}
    </div>
  );
}

export function ActivityList({
  previousMissionEnd,
  activities,
  allMissionActivities,
  editActivityEvent,
  createActivity,
  teamChanges,
  allowTeamMode = false,
  allowSupportActivity = false,
  nullableEndTimeInEditActivity,
  isMissionEnded,
  fromTime = null,
  untilTime = null,
  disableEmptyMessage = false,
  hideChart = false,
  eventsHistory = [],
  shouldDisplayInitialEmployeeVersion = false,
  employeeValidationTime = null,
  onDispute = null,
  onCancelDispute = null
}) {
  const ref = React.useRef();
  const now1 = now();

  const filteredActivities = filterActivitiesOverlappingPeriod(
    activities,
    fromTime,
    untilTime
  );

  const eventsByActivityId = React.useMemo(() => {
    const map = new Map();
    eventsHistory.forEach((e) => {
      if (e.resourceType === "activity") {
        const list = map.get(e.resourceId) || [];
        list.push(e);
        map.set(e.resourceId, list);
      }
    });
    return map;
  }, [eventsHistory]);

  const hasActivitiesBeforeMinTime =
    fromTime && filteredActivities.some(a => a.startTime < fromTime);
  const hasActivitiesAfterMaxTime =
    untilTime &&
    filteredActivities.some(a => !a.endTime || a.endTime > untilTime);

  // Add breaks
  const activitiesWithBreaks = addBreaksToActivityList(filteredActivities);

  // Compute duration and end time for each activity
  const augmentedAndSortedActivities = computeDurationAndTime(
    activitiesWithBreaks,
    fromTime,
    untilTime
  );

  const datetimeFormatter = useDateTimeFormatter(
    augmentedAndSortedActivities,
    !isMissionEnded
  );

  const [view, setView] = React.useState("list");

  const latestActivity =
    augmentedAndSortedActivities[augmentedAndSortedActivities.length - 1];

  if (!isMissionEnded && latestActivity && latestActivity.endTime) {
    augmentedAndSortedActivities.push({
      type: ACTIVITIES.break.name,
      startTime: latestActivity.endTime,
      displayedStartTime: latestActivity.endTime,
      endTime: null,
      displayedEndTime: null,
      endTimeOrNow: now1
    });
  }

  const canDisplayChart = !hideChart;

  const classes = useStyles();

  return (
    <Container ref={ref} maxWidth={false} disableGutters>
      {hasActivitiesBeforeMinTime && (
        <Box textAlign="left">
          <Description>
            Les activités avant minuit le jour précédent ne sont pas incluses.
          </Description>
        </Box>
      )}
      {canDisplayChart && (
        <Box my={1} textAlign="left">
          <SegmentedControl
            legend="Options de visualisation"
            small
            classes={{
              root: classes.switch
            }}
            hideLegend
            segments={[
              {
                label: "Liste",
                nativeInputProps: {
                  onChange: () => setView("list"),
                  checked: view === "list"
                }
              },
              {
                label: "Frise",
                nativeInputProps: {
                  onChange: () => setView("timeline"),
                  checked: view === "timeline"
                }
              },
              {
                label: "Global",
                nativeInputProps: {
                  onChange: () => setView("chart"),
                  checked: view === "chart"
                }
              }
            ]}
          />
        </Box>
      )}
      {(view === "list" || !canDisplayChart) && (
        <div className={classes.activityListContainer}>
          {augmentedAndSortedActivities.length === 0 &&
            !disableEmptyMessage && (
              <Description>Pas d'activités sur cette journée</Description>
            )}
          {augmentedAndSortedActivities.map((activity, index) => (
            <ActivityItem
              activity={activity}
              editActivityEvent={editActivityEvent}
              createActivity={createActivity}
              allMissionActivities={allMissionActivities}
              previousMissionEnd={previousMissionEnd}
              teamChanges={teamChanges}
              allowTeamMode={allowTeamMode}
              allowSupportActivity={allowSupportActivity}
              nullableEndTimeInEditActivity={nullableEndTimeInEditActivity}
              key={activity.id ? "a" + activity.id : index}
              datetimeFormatter={datetimeFormatter}
              activityEvents={eventsByActivityId.get(activity.id) || []}
              shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
              employeeValidationTime={employeeValidationTime}
              onDispute={onDispute}
              onCancelDispute={onCancelDispute}
            />
          ))}
        </div>
      )}
      {view === "chart" && canDisplayChart && (
        <ActivitiesPieChart
          activities={augmentedAndSortedActivities}
          fromTime={fromTime}
          untilTime={untilTime}
        />
      )}
      {view === "timeline" && canDisplayChart && (
        <VerticalTimeline
          datetimeFormatter={datetimeFormatter}
          width={ref.current.offsetWidth}
          activities={augmentedAndSortedActivities}
          allowSupportActivity={allowSupportActivity}
        />
      )}
      {hasActivitiesAfterMaxTime && (
        <Description>
          Les activités après minuit le jour suivant ne sont pas incluses.
        </Description>
      )}
    </Container>
  );
}
