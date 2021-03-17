import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { ACTIVITIES } from "common/utils/activities";
import {
  formatDateTime,
  formatLongTimer,
  formatTimeOfDay,
  getStartOfDay,
  now
} from "common/utils/time";
import { getTime, sortEvents } from "common/utils/events";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import CreateIcon from "@material-ui/icons/Create";
import { useModals } from "common/utils/modals";
import { Typography } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  infoText: {
    color: theme.palette.grey[500],
    fontStyle: "italic"
  }
}));

function ActivityItem({
  activity,
  editActivityEvent,
  allMissionActivities,
  previousMissionEnd,
  nextMissionStart,
  teamChanges,
  nullableEndTimeInEditActivity,
  showDates = false
}) {
  const modals = useModals();

  const datetimeFormatter = showDates ? formatDateTime : formatTimeOfDay;

  return (
    <ListItem disableGutters>
      <ListItemAvatar>
        <Avatar>
          {ACTIVITIES[activity.type].renderIcon({ color: "primary" })}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={ACTIVITIES[activity.type].label}
        secondary={`${datetimeFormatter(activity.displayedStartTime)} - ${
          activity.displayedEndTime
            ? `${datetimeFormatter(
                activity.displayedEndTime
              )} - ${formatLongTimer(activity.duration)}`
            : "En cours"
        }`}
        secondaryTypographyProps={{ color: "primary" }}
      />
      {editActivityEvent && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            color="primary"
            onClick={() =>
              modals.open("activityRevision", {
                event: activity,
                otherActivities: allMissionActivities.filter(
                  a => getTime(a) !== getTime(activity)
                ),
                handleRevisionAction: (
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
                previousMissionEnd,
                nextMissionStart,
                cancellable: true,
                teamChanges,
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
  nextMissionStart,
  activities,
  allMissionActivities,
  editActivityEvent,
  teamChanges,
  nullableEndTimeInEditActivity,
  isMissionEnded,
  fromTime = null,
  untilTime = null
}) {
  const filteredActivities = activities.filter(
    a =>
      (!fromTime || a.endTime > fromTime) &&
      (!untilTime || a.startTime < untilTime)
  );
  const hasActivitiesBeforeMinTime =
    fromTime && filteredActivities.some(a => a.startTime < fromTime);
  const hasActivitiesAfterMaxTime =
    untilTime &&
    filteredActivities.some(a => !a.endTime || a.endTime > untilTime);

  // Compute duration and end time for each activity
  const augmentedAndSortedActivities = filteredActivities.map(activity => {
    const startTime = Math.max(activity.startTime, fromTime);
    const endTime = untilTime
      ? Math.min(activity.endTime || now(), untilTime)
      : activity.endTime;
    const endTimeOrNow = endTime || now();
    return {
      ...activity,
      displayedStartTime: startTime,
      displayedEndTime: endTime,
      endTimeOrNow,
      duration: endTimeOrNow - startTime
    };
  });

  const showDates =
    augmentedAndSortedActivities.length > 0
      ? !isMissionEnded
        ? getStartOfDay(augmentedAndSortedActivities[0].displayedStartTime) !==
          getStartOfDay(now())
        : getStartOfDay(augmentedAndSortedActivities[0].displayedStartTime) !==
          getStartOfDay(
            augmentedAndSortedActivities[
              augmentedAndSortedActivities.length - 1
            ].displayedEndTime
          )
      : false;

  sortEvents(augmentedAndSortedActivities).reverse();
  const latestActivity = augmentedAndSortedActivities[0];

  const classes = useStyles();

  return (
    <List dense>
      {hasActivitiesAfterMaxTime && (
        <Typography variant="body2" className={classes.infoText}>
          Les activités après minuit le jour suivant ne sont pas affichées
        </Typography>
      )}
      {!isMissionEnded && latestActivity && latestActivity.endTime && (
        <ListItem disableGutters key={"trailingBreak"}>
          <ListItemAvatar>
            <Avatar>{ACTIVITIES.break.renderIcon()}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${ACTIVITIES.break.label} - ${formatTimeOfDay(
              latestActivity.endTime
            )} - En cours`}
          />
        </ListItem>
      )}
      {augmentedAndSortedActivities.length === 0 && (
        <Typography variant="body2" className={classes.infoText}>
          Pas d'activités sur cette journée
        </Typography>
      )}
      {augmentedAndSortedActivities.map((activity, index) => {
        let nextActivity;
        let breakItemBefore;
        if (index < augmentedAndSortedActivities.length - 1) {
          nextActivity = augmentedAndSortedActivities[index + 1];
          if (activity.startTime > nextActivity.endTime) {
            breakItemBefore = (
              <ListItem disableGutters key={"break" + index}>
                <ListItemAvatar>
                  <Avatar>{ACTIVITIES.break.renderIcon()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${ACTIVITIES.break.label} - ${formatTimeOfDay(
                    nextActivity.endTime
                  )} - ${formatLongTimer(
                    getTime(activity) - nextActivity.endTime
                  )}`}
                />
              </ListItem>
            );
          }
        }
        return [
          <ActivityItem
            activity={activity}
            editActivityEvent={editActivityEvent}
            allMissionActivities={allMissionActivities}
            previousMissionEnd={previousMissionEnd}
            nextMissionStart={nextMissionStart}
            teamChanges={teamChanges}
            nullableEndTimeInEditActivity={nullableEndTimeInEditActivity}
            key={index}
            showDates={showDates}
          />,
          breakItemBefore
        ];
      })}
      {hasActivitiesBeforeMinTime && (
        <Typography variant="body2" className={classes.infoText}>
          Les activités avant minuit le jour précédent ne sont pas affichées
        </Typography>
      )}
    </List>
  );
}
