import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import { ACTIVITIES } from "common/utils/activities";
import { formatLongTimer, formatTimeOfDay } from "common/utils/time";
import { getTime, sortEvents } from "common/utils/events";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import CreateIcon from "@material-ui/icons/Create";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    overflowY: "auto"
  }
}));

export function ActivityList({
  mission,
  previousMissionEnd,
  activities,
  editActivityEvent
}) {
  const classes = useStyles();
  const modals = useModals();

  // Compute duration for each activity
  activities.forEach((activity, index) => {
    if (index < activities.length - 1) {
      const nextActivity = activities[index + 1];
      activity.duration = getTime(nextActivity) - getTime(activity);
    }
  });

  return (
    <Container className={classes.container}>
      <Typography style={{ textAlign: "left" }} className="bold">
        Détail de la mission{mission.name ? ` : ${mission.name}` : ""}
      </Typography>
      <List className="scrollable">
        {sortEvents(activities)
          .reverse()
          .map((activity, index) => (
            <ListItem disableGutters key={index}>
              <ListItemAvatar>
                <Avatar>
                  {ACTIVITIES[activity.type].renderIcon({ color: "primary" })}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={ACTIVITIES[activity.type].label}
                secondary={`${formatTimeOfDay(getTime(activity))} - ${
                  activity.duration
                    ? formatLongTimer(activity.duration)
                    : "En cours"
                }`}
                secondaryTypographyProps={{ color: "primary" }}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={() =>
                    modals.open("activityRevision", {
                      event: activity,
                      handleRevisionAction: (
                        actionType,
                        newUserTime,
                        userComment
                      ) =>
                        editActivityEvent(
                          activity,
                          actionType,
                          newUserTime,
                          userComment
                        ),
                      minStartTime: previousMissionEnd + 1,
                      maxStartTime: Date.now(),
                      cancellable: true
                    })
                  }
                >
                  <CreateIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
      </List>
    </Container>
  );
}
