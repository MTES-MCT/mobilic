import Container from "@material-ui/core/Container";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import Divider from "@material-ui/core/Divider";
import PeopleIcon from "@material-ui/icons/People";
import PersonIcon from "@material-ui/icons/Person";
import WorkIcon from "@material-ui/icons/Work";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import CreateIcon from "@material-ui/icons/Create";
import React from "react";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/store";
import { UserNameHeader } from "../../common/components/UserNameHeader";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import List from "@material-ui/core/List";
import { resolveCurrentTeam } from "../../common/utils/coworkers";
import ListItemText from "@material-ui/core/ListItemText";
import { ListItemSecondaryAction } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ListSubheader from "@material-ui/core/ListSubheader";
import { ACTIVITIES } from "../../common/utils/activities";
import { prettyFormatDay } from "../../common/utils/time";
import { COMMENT_LOG_MUTATION, useApi } from "../../common/utils/api";
import { ModalContext } from "../../common/utils/modals";
import useTheme from "@material-ui/core/styles/useTheme";
import Box from "@material-ui/core/Box";
import { isGraphQLParsingError } from "../../common/utils/errors";

export function DailyContext({
  currentActivity,
  currentDayActivityEvents,
  previousDaysEventsByDay
}) {
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const modals = React.useContext(ModalContext);
  const theme = useTheme();

  const isCurrentDayStarted =
    currentActivity && currentActivity.type !== ACTIVITIES.rest.name;

  const relevantDayEvents = isCurrentDayStarted
    ? currentDayActivityEvents
    : previousDaysEventsByDay[previousDaysEventsByDay.length - 1];

  const firstActivityOfTheDay =
    relevantDayEvents && relevantDayEvents.length > 0
      ? relevantDayEvents[0]
      : null;

  const comments = storeSyncedWithLocalStorage
    .comments()
    .filter(c => c.eventTime >= firstActivityOfTheDay.eventTime);

  const team = resolveCurrentTeam(currentActivity, storeSyncedWithLocalStorage);

  const pushNewComment = content => {
    storeSyncedWithLocalStorage.pushNewComment(content, team, async () => {
      const commentsToSubmit = storeSyncedWithLocalStorage.commentsPendingSubmission();
      try {
        const commentsSubmit = await api.graphQlMutate(COMMENT_LOG_MUTATION, {
          data: commentsToSubmit
        });
        const comments = commentsSubmit.data.logComments.comments;
        storeSyncedWithLocalStorage.setComments(comments);
      } catch (err) {
        if (isGraphQLParsingError(err)) {
          storeSyncedWithLocalStorage.setComments(
            storeSyncedWithLocalStorage
              .comments()
              .filter(
                comment =>
                  !commentsToSubmit
                    .map(c => c.eventTime)
                    .includes(comment.eventTime)
              )
          );
        }
      }
    });
  };

  return (
    <Container className="app-container">
      <UserNameHeader withCompanyNameBelow={true} />
      <Divider className="full-width-divider" />
      {firstActivityOfTheDay && (
        <List
          style={{ overflowY: "scroll" }}
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
                  ? "Journée en cours"
                  : `Journée du ${prettyFormatDay(
                      firstActivityOfTheDay.eventTime
                    )}`}
              </Typography>
            </ListSubheader>
          }
        >
          <ListItem disableGutters>
            <ListItemIcon color="primary">
              {team.length === 1 ? (
                <PersonIcon color="primary" />
              ) : (
                <PeopleIcon color="primary" />
              )}
            </ListItemIcon>
            <ListItemText
              className="new-lines-on-overflow"
              primary={
                team.length === 1
                  ? "En solo"
                  : `${team.length - 1} coéquipier${
                      team.length > 2 ? "s" : ""
                    } : ${team
                      .filter(
                        tm => tm.id !== storeSyncedWithLocalStorage.userId()
                      )
                      .map(mate => mate.firstName)
                      .join(", ")}`
              }
            />
          </ListItem>
          <ListItem className="new-lines-on-overflow" disableGutters>
            <ListItemIcon>
              <DriveEtaIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={`Véhicule : ${currentActivity.vehicleRegistrationNumber}`}
            />
          </ListItem>
          <ListItem className="new-lines-on-overflow" disableGutters>
            <ListItemIcon>
              <WorkIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary={`Mission : ${currentActivity.mission}`} />
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
  );
}
