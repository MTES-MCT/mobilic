import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Avatar from "@mui/material/Avatar";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import {
  ACTIVITIES,
  ACTIVITIES_OPERATIONS,
  addBreaksToActivityList,
  computeDurationAndTime,
  filterActivitiesOverlappingPeriod
} from "common/utils/activities";
import {
  formatLongTimer,
  formatTimeOfDay,
  LONG_BREAK_DURATION,
  now,
  useDateTimeFormatter
} from "common/utils/time";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import CreateIcon from "@mui/icons-material/Create";
import { useModals } from "common/utils/modals";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";

const useStyles = makeStyles(theme => ({
  infoText: {
    color: theme.palette.grey[500],
    fontStyle: "italic"
  },
  longBreak: {
    color: theme.palette.success.main
  },
  avatar: props => ({
    backgroundColor: props.color,
    color: theme.palette.primary.contrastText
  }),
  toggleContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  pieContainer: {
    maxWidth: 300,
    margin: "auto"
  },
  blurred: {
    opacity: 0.3
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
  datetimeFormatter = formatTimeOfDay
}) {
  const modals = useModals();
  const classes = useStyles({ color: ACTIVITIES[activity.type].color });

  const isBreak = activity.type === ACTIVITIES.break.name;
  const isLongBreak =
    isBreak && activity.duration && activity.duration >= LONG_BREAK_DURATION;

  return (
    <ListItem disableGutters>
      <ListItemAvatar>
        <Avatar className={classes.avatar}>
          {ACTIVITIES[activity.type].renderIcon()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Typography className={isLongBreak ? classes.longBreak : ""}>
            {isLongBreak
              ? "Repos journalier"
              : `${ACTIVITIES[activity.type].label}${
                  activity.isMissionDeleted ? " (activité supprimée)" : ""
                }`}
          </Typography>
        }
        secondary={
          <>
            <Typography
              color={!isBreak ? "primary" : "textSecondary"}
              className={isLongBreak ? classes.longBreak : ""}
              style={
                activity.operation?.type === ACTIVITIES_OPERATIONS.update
                  ? { textDecoration: "line-through" }
                  : {}
              }
            >
              {`${datetimeFormatter(activity.displayedStartTime)} - ${
                activity.displayedEndTime
                  ? `${datetimeFormatter(
                      activity.displayedEndTime
                    )} - ${formatLongTimer(activity.duration)}`
                  : "En cours"
              }`}
            </Typography>
            {activity.operation?.type === ACTIVITIES_OPERATIONS.update && (
              <Typography color="primary">
                {`${datetimeFormatter(activity.operation.startTime)} - ${
                  activity.operation.endTime
                    ? `${datetimeFormatter(
                        activity.operation.endTime
                      )} - ${formatLongTimer(
                        activity.operation.endTime -
                          activity.operation.startTime
                      )}`
                    : "En cours"
                }`}
              </Typography>
            )}
          </>
        }
      />
      {editActivityEvent && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            color="primary"
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
                nullableEndTime: nullableEndTimeInEditActivity
              })
            }
          >
            <CreateIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
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
  nullableEndTimeInEditActivity,
  isMissionEnded,
  fromTime = null,
  untilTime = null,
  disableEmptyMessage = false,
  hideChart = false
}) {
  const ref = React.useRef();
  const now1 = now();

  const filteredActivities = filterActivitiesOverlappingPeriod(
    activities,
    fromTime,
    untilTime
  );

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
      {canDisplayChart && (
        <ToggleButtonGroup
          className={classes.toggleContainer}
          value={view}
          exclusive
          onChange={(e, newView) => {
            if (newView) setView(newView);
          }}
          size="small"
        >
          <ToggleButton key="list" value="list">
            Liste
          </ToggleButton>
          <ToggleButton key="timeline" value="timeline">
            Frise
          </ToggleButton>
          <ToggleButton key="chart" value="chart">
            Global
          </ToggleButton>
        </ToggleButtonGroup>
      )}
      {hasActivitiesBeforeMinTime && (
        <Typography variant="body2" className={classes.infoText}>
          Les activités avant minuit le jour précédent ne sont pas incluses.
        </Typography>
      )}
      {(view === "list" || !canDisplayChart) && (
        <List dense>
          {augmentedAndSortedActivities.length === 0 && !disableEmptyMessage && (
            <Typography variant="body2" className={classes.infoText}>
              Pas d'activités sur cette journée
            </Typography>
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
              nullableEndTimeInEditActivity={nullableEndTimeInEditActivity}
              key={activity.id ? "a" + activity.id : index}
              datetimeFormatter={datetimeFormatter}
            />
          ))}
        </List>
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
        />
      )}
      {hasActivitiesAfterMaxTime && (
        <Typography variant="body2" className={classes.infoText}>
          Les activités après minuit le jour suivant ne sont pas incluses.
        </Typography>
      )}
    </Container>
  );
}
