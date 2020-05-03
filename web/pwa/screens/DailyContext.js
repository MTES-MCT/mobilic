import Container from "@material-ui/core/Container";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import WorkIcon from "@material-ui/icons/Work";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import CreateIcon from "@material-ui/icons/Create";
import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { UserHeader } from "../../common/UserHeader";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import { ListItemSecondaryAction } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ListSubheader from "@material-ui/core/ListSubheader";
import { ACTIVITIES } from "common/utils/activities";
import { prettyFormatDay } from "common/utils/time";
import { useModals } from "common/utils/modals";
import useTheme from "@material-ui/core/styles/useTheme";
import { getTime } from "common/utils/events";
import {resolveTeam} from "common/utils/coworkers";

export function DailyContext({
  currentActivity,
  currentDayActivityEvents,
  previousDaysActivityEventsByDay,
  pushNewTeamEnrollmentOrRelease,
  latestMission,
  currentVehicleBookingForLatestMission,
  pushNewVehicleBooking,
  pushNewComment
}) {
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();
  const theme = useTheme();

  const isCurrentDayStarted =
    currentActivity && currentActivity.type !== ACTIVITIES.rest.name;

  const relevantDayEvents = isCurrentDayStarted
    ? currentDayActivityEvents
    : previousDaysActivityEventsByDay[
        previousDaysActivityEventsByDay.length - 1
      ];

  const firstActivityOfTheDay =
    relevantDayEvents && relevantDayEvents.length > 0
      ? relevantDayEvents[0]
      : null;

  const comments = firstActivityOfTheDay
    ? store.getArray("comments").filter(c => getTime(c) >= getTime(firstActivityOfTheDay))
    : [];

  const team = resolveTeam(store);

  return [
    <UserHeader key={1} withCompanyNameBelow={true} />,
    <Container key={2} className="scrollable" maxWidth={false}>
      {firstActivityOfTheDay && (
        <List
          subheader={
            <ListSubheader
              disableGutters
              style={{
                paddingTop: "16px",
                zIndex: 1000,
                backgroundColor: theme.palette.background.default
              }}
            >
              <Typography className="bold" variant="body1" align="left">
                {isCurrentDayStarted
                  ? "Mission en cours"
                  : `Mission du ${prettyFormatDay(
                      getTime(firstActivityOfTheDay)
                    )}`}
              </Typography>
            </ListSubheader>
          }
        >
          <ListItem className="new-lines-on-overflow" disableGutters>
            <ListItemIcon>
              <WorkIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={`Nom : ${
                latestMission ? latestMission.name : ""
              }`}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon color="primary">
              {team.length === 0 ? (
                <PersonIcon color="primary" />
              ) : (
                <PeopleIcon color="primary" />
              )}
            </ListItemIcon>
            <ListItemText
              className="new-lines-on-overflow"
              primary={
                team.length === 0
                  ? "En solo"
                  : `${team.length} coéquipier${
                      team.length > 1 ? "s" : ""
                    } : ${team.map(mate => mate.firstName).join(", ")}`
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() =>
                  modals.open("teamSelection", {
                    useCurrentEnrollment: true,
                    handleContinue: updatedCoworkers => {
                      updatedCoworkers.forEach(
                        cw =>
                          pushNewTeamEnrollmentOrRelease(
                            cw.id,
                            cw.firstName,
                            cw.lastName,
                            cw.enroll
                          )
                      );
                      modals.close("teamSelection");
                    }
                  })
                }
                disabled={!isCurrentDayStarted}
              >
                <CreateIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem className="new-lines-on-overflow" disableGutters>
            <ListItemIcon>
              <DriveEtaIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={`Véhicule : ${
                currentVehicleBookingForLatestMission ? currentVehicleBookingForLatestMission.vehicleName : ""
              }`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() =>
                  modals.open("vehicleBooking", {
                    currentVehicleBooking: currentVehicleBookingForLatestMission,
                    handleContinue: pushNewVehicleBooking
                  })
                }
                disabled={!isCurrentDayStarted}
              >
                <CreateIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem className="new-lines-on-overflow" disableGutters>
            <ListItemIcon>
              <AnnouncementIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Commentaires" />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() =>
                  modals.open("commentInput", {
                    handleContinue: pushNewComment
                  })
                }
              >
                <CreateIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <List component="div" disablePadding>
            {comments.map((comment, index) => (
              <ListItem
                className="new-lines-on-overflow"
                key={index}
                dense
                disableGutters
              >
                <ListItemIcon className="hidden">
                  <AnnouncementIcon />
                </ListItemIcon>
                <ListItemText primary={comment.content} />
              </ListItem>
            ))}
          </List>
        </List>
      )}
    </Container>
  ];
}
