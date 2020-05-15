import { MissionReviewSection } from "./MissionReviewSection";
import { ActivityList } from "./ActivityList";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import PersonIcon from "@material-ui/core/SvgIcon/SvgIcon";
import Typography from "@material-ui/core/Typography";
import {
  formatLatestEnrollmentStatus,
  formatPersonName
} from "common/utils/coworkers";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import { EXPENDITURES } from "common/utils/expenditures";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";
import { getTime } from "common/utils/events";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const useStyles = makeStyles(theme => ({
  backgroundPaper: {
    backgroundColor: theme.palette.background.paper
  },
  expenditures: {
    flexWrap: "wrap",
    textAlign: "left",
    textTransform: "capitalize",
    "& > *": {
      margin: theme.spacing(0.5)
    }
  }
}));

export function MissionDetails({
  mission,
  editActivityEvent,
  editExpenditures,
  previousMissionEnd,
  hideExpenditures,
  createActivity
}) {
  const classes = useStyles();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const userId = store.userId();

  const lastMissionActivity = mission.activities[mission.activities.length - 1];

  const teamChanges = mission.teamChanges.filter(
    tc => tc.coworker.id !== userId
  );
  const teamMatesLatestStatuses = map(
    groupBy(teamChanges, tc => tc.coworker.id || formatPersonName(tc.coworker)),
    statuses => statuses[statuses.length - 1]
  );

  return [
    <MissionReviewSection
      key={0}
      title="Activités"
      className="unshrinkable"
      editButtonLabel="Ajouter"
      onEdit={
        createActivity
          ? () =>
              modals.open("activityRevision", {
                createActivity: args =>
                  createActivity({ ...args, missionId: mission.id }),
                minStartTime: previousMissionEnd + 1,
                maxStartTime: mission.isComplete
                  ? getTime(lastMissionActivity) - 1
                  : Date.now()
              })
          : null
      }
    >
      <ActivityList
        activities={mission.activities}
        editActivityEvent={editActivityEvent}
        previousMissionEnd={0}
      />
    </MissionReviewSection>,
    teamMatesLatestStatuses.length > 0 && (
      <MissionReviewSection
        key={1}
        title="Coéquipiers"
        className={`${classes.backgroundPaper} unshrinkable`}
        mb={hideExpenditures && 4}
      >
        <List dense>
          {teamMatesLatestStatuses.map((tc, index) => (
            <ListItem disableGutters key={index}>
              <PersonIcon />
              <Typography>{`${
                tc.coworker.firstName
              } (${formatLatestEnrollmentStatus(tc)})`}</Typography>
            </ListItem>
          ))}
        </List>
      </MissionReviewSection>
    ),
    !hideExpenditures && (
      <MissionReviewSection
        key={2}
        title="Frais"
        className={`unshrinkable ${teamMatesLatestStatuses.length === 0 &&
          classes.backgroundPaper}`}
        mb={2}
        onEdit={
          editExpenditures
            ? () =>
                modals.open("expenditures", {
                  handleSubmit: expenditures =>
                    editExpenditures(mission, expenditures),
                  currentExpenditures: mission.expenditures
                })
            : null
        }
      >
        <Box className={`flex-row ${classes.expenditures}`}>
          {mission.expenditures &&
            Object.keys(mission.expenditures)
              .filter(exp => mission.expenditures[exp] > 0)
              .map(exp => <Chip key={exp} label={EXPENDITURES[exp].label} />)}
        </Box>
      </MissionReviewSection>
    )
  ];
}
