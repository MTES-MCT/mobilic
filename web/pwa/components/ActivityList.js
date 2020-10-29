import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { ACTIVITIES } from "common/utils/activities";
import { formatLongTimer, formatTimeOfDay, now } from "common/utils/time";
import { getTime, sortEvents } from "common/utils/events";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import CreateIcon from "@material-ui/icons/Create";
import { useModals } from "common/utils/modals";

function ActivityItem({
  activity,
  editActivityEvent,
  allMissionActivities,
  previousMissionEnd,
  nextMissionStart,
  teamChanges,
  nullableEndTimeInEditActivity
}) {
  const modals = useModals();

  return (
    <ListItem disableGutters>
      <ListItemAvatar>
        <Avatar>
          {ACTIVITIES[activity.type].renderIcon({ color: "primary" })}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={ACTIVITIES[activity.type].label}
        secondary={`${formatTimeOfDay(getTime(activity))} - ${
          activity.endTime
            ? `${formatTimeOfDay(activity.endTime)} - ${formatLongTimer(
                activity.duration
              )}`
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
                    allMissionActivities,
                    newUserStartTime,
                    newUserEndTime,
                    userComment,
                    forAllTeam
                  ),
                minStartTime: previousMissionEnd,
                maxStartTime: nextMissionStart,
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
  nullableEndTimeInEditActivity
}) {
  // Compute duration and end time for each activity
  const augmentedAndSortedActivities = activities.map(activity => ({
    ...activity,
    duration: (activity.endTime || now()) - activity.startTime
  }));

  sortEvents(augmentedAndSortedActivities).reverse();

  return (
    <List dense>
      {augmentedAndSortedActivities.map((activity, index) => {
        let nextActivity;
        let breakItem;
        if (index < augmentedAndSortedActivities.length - 1) {
          nextActivity = augmentedAndSortedActivities[index + 1];
        }
        if (nextActivity && activity.startTime > nextActivity.endTime) {
          breakItem = (
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
          />,
          breakItem
        ];
      })}
    </List>
  );
}
