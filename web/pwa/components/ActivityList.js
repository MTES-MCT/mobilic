import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Avatar from "@material-ui/core/Avatar";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import {
  ACTIVITIES,
  filterActivitiesOverlappingPeriod
} from "common/utils/activities";
import {
  formatDateTime,
  formatLongTimer,
  formatTimeOfDay,
  formatTimer,
  getStartOfDay,
  LONG_BREAK_DURATION,
  now
} from "common/utils/time";
import { getTime, sortEvents } from "common/utils/events";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import CreateIcon from "@material-ui/icons/Create";
import { useModals } from "common/utils/modals";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from "recharts";
import { computeTotalActivityDurations } from "common/utils/metrics";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";

const RADIAN = Math.PI / 180;
function renderCustomizedLabel(
  name,
  { cx, cy, startAngle, endAngle, innerRadius, outerRadius }
) {
  if (endAngle - startAngle < 20) return null;
  let radiusIndex = 0.5;
  if (endAngle - startAngle < 30) radiusIndex = 0.8;
  else if (endAngle - startAngle < 40) radiusIndex = 0.7;

  const midAngle = (startAngle + endAngle) / 2;
  const radius = innerRadius + (outerRadius - innerRadius) * radiusIndex;
  const x = cx + radius * Math.cos(-midAngle * RADIAN) - 9;
  const y = cy + radius * Math.sin(-midAngle * RADIAN) - 9;

  return ACTIVITIES[name].renderIcon({
    x,
    y,
    textAnchor: x > cx ? "start" : "end",
    dominantBaseline: "central",
    style: { color: "white" },
    height: 18,
    width: 18
  });
}

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
  nextMissionStart,
  teamChanges,
  nullableEndTimeInEditActivity,
  allowTeamMode,
  showDates = false
}) {
  const modals = useModals();
  const classes = useStyles({ color: ACTIVITIES[activity.type].color });

  const datetimeFormatter = showDates ? formatDateTime : formatTimeOfDay;
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
        primary={
          isLongBreak ? "Repos journalier" : ACTIVITIES[activity.type].label
        }
        primaryTypographyProps={
          isLongBreak ? { className: classes.longBreak } : {}
        }
        secondary={`${datetimeFormatter(activity.displayedStartTime)} - ${
          activity.displayedEndTime
            ? `${datetimeFormatter(
                activity.displayedEndTime
              )} - ${formatLongTimer(activity.duration)}`
            : "En cours"
        }`}
        secondaryTypographyProps={
          isLongBreak
            ? { className: classes.longBreak }
            : isBreak
            ? {}
            : { color: "primary" }
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
                      a => getTime(a) !== getTime(activity)
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
                nextMissionStart,
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
  nextMissionStart,
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
  const activitiesWithBreaks = [];
  sortEvents(filteredActivities);
  filteredActivities.forEach((a, index) => {
    activitiesWithBreaks.push(a);
    if (index < filteredActivities.length - 1) {
      const nextA = filteredActivities[index + 1];
      if (a.endTime < nextA.startTime)
        activitiesWithBreaks.push({
          type: ACTIVITIES.break.name,
          startTime: a.endTime,
          endTime: nextA.startTime
        });
    }
  });

  // Compute duration and end time for each activity
  const augmentedAndSortedActivities = activitiesWithBreaks.map(activity => {
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

  const stats = computeTotalActivityDurations(
    augmentedAndSortedActivities,
    fromTime,
    untilTime
  );

  const showDates =
    augmentedAndSortedActivities.length > 0
      ? !isMissionEnded
        ? getStartOfDay(augmentedAndSortedActivities[0].displayedStartTime) !==
          getStartOfDay(now())
        : getStartOfDay(augmentedAndSortedActivities[0].displayedStartTime) !==
          getStartOfDay(
            augmentedAndSortedActivities[
              augmentedAndSortedActivities.length - 1
            ].displayedEndTime - 1
          )
      : false;

  const [view, setView] = React.useState("list");

  augmentedAndSortedActivities.reverse();
  const latestActivity = augmentedAndSortedActivities[0];

  const canDisplayChart = !hideChart && stats.total > 0;

  const classes = useStyles();
  const pieData = Object.values(ACTIVITIES)
    .map(a => ({
      title: a.label,
      value: Math.round((stats[a.name] * 100.0) / stats.total),
      color: a.color,
      name: a.name,
      label: formatTimer(stats[a.name])
    }))
    .filter(a => !!a.value);

  return (
    <Container maxWidth={false} disableGutters>
      {canDisplayChart && (
        <Grid component="label" container alignItems="center" spacing={1}>
          <Grid item>
            <Typography
              variant="caption"
              className={view === "chart" && classes.blurred}
            >
              Liste
            </Typography>
          </Grid>
          <Grid item>
            <Switch
              className={classes.switch}
              checked={view === "chart"}
              onChange={() =>
                setView(view => (view === "chart" ? "list" : "chart"))
              }
              name="chart-toggle"
            />
          </Grid>
          <Grid item>
            <Typography
              variant="caption"
              className={view === "list" && classes.blurred}
            >
              Graphique
            </Typography>
          </Grid>
        </Grid>
      )}
      {(view === "list" || !canDisplayChart) && (
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
                primary={ACTIVITIES.break.label}
                secondary={`${(showDates ? formatDateTime : formatTimeOfDay)(
                  latestActivity.endTime
                )} - En cours`}
              />
            </ListItem>
          )}
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
              nextMissionStart={nextMissionStart}
              teamChanges={teamChanges}
              allowTeamMode={allowTeamMode}
              nullableEndTimeInEditActivity={nullableEndTimeInEditActivity}
              key={activity.id ? "a" + activity.id : index}
              showDates={showDates}
            />
          ))}
          {hasActivitiesBeforeMinTime && (
            <Typography variant="body2" className={classes.infoText}>
              Les activités avant minuit le jour précédent ne sont pas affichées
            </Typography>
          )}
        </List>
      )}
      {view === "chart" && canDisplayChart && (
        <ResponsiveContainer
          aspect={1}
          minWidth={200}
          minHeight={200}
          maxHeight={300}
          width="100%"
          height="100%"
          className={classes.pieContainer}
        >
          <PieChart style={{ margin: "auto", maxHeight: 300, maxWidth: 300 }}>
            <Pie
              cx="50%"
              cy="50%"
              outerRadius={65}
              data={pieData}
              dataKey="value"
              nameKey="name"
              label={entry => entry.label}
            >
              <LabelList
                dataKey="label"
                position="inside"
                content={entry =>
                  renderCustomizedLabel(entry.name, entry.viewBox)
                }
              />
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </Container>
  );
}
