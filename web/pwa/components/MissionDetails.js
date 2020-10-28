import { MissionReviewSection } from "./MissionReviewSection";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import { ActivityList } from "./ActivityList";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {
  computeLatestEnrollmentStatuses,
  formatLatestEnrollmentStatus,
  resolveTeamAt
} from "common/utils/coworkers";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import { EXPENDITURES } from "common/utils/expenditures";
import React from "react";
import map from "lodash/map";
import omit from "lodash/omit";
import fromPairs from "lodash/fromPairs";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { getVehicleName } from "common/utils/vehicles";
import { PersonIcon } from "common/utils/icons";

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

function AlternateColors({ children }) {
  const classes = useStyles();
  return React.Children.map(children, (child, index) => (
    <Box
      className={index % 2 === 1 ? classes.backgroundPaper : ""}
      mb={index === React.Children.count(children) - 1 ? 2 : 0}
    >
      {child}
    </Box>
  ));
}

export function MissionDetails({
  mission,
  editActivityEvent,
  nullableEndTimeInEditActivity = true,
  editExpenditures,
  previousMissionEnd,
  nextMissionStart,
  hideExpenditures,
  createActivity,
  changeTeam
}) {
  const classes = useStyles();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const userId = store.userId();

  const coworkers = store.getEntity("coworkers");

  let teamChanges = omit(mission.teamChanges, [userId]);

  const teamAtMissionEnd = [userId, ...resolveTeamAt(teamChanges, Date.now())];

  const teamMatesLatestStatuses = computeLatestEnrollmentStatuses(teamChanges);
  const isTeamMode = Object.keys(teamMatesLatestStatuses).length > 0;

  return (
    <AlternateColors>
      <MissionReviewSection
        title="Activités"
        editButtonLabel="Ajouter"
        onEdit={
          createActivity
            ? () =>
                modals.open("activityRevision", {
                  otherActivities: mission.allActivities,
                  createActivity: args =>
                    createActivity({
                      ...args,
                      missionActivities: mission.allActivities,
                      missionId: mission.id
                    }),
                  minStartTime: previousMissionEnd,
                  maxStartTime: nextMissionStart,
                  teamChanges,
                  nullableEndTime: nullableEndTimeInEditActivity
                })
            : null
        }
      >
        <ActivityList
          activities={mission.activities}
          allMissionActivities={mission.allActivities}
          editActivityEvent={editActivityEvent}
          nextMissionStart={nextMissionStart}
          previousMissionEnd={previousMissionEnd}
          teamChanges={teamChanges}
          nullableEndTimeInEditActivity={nullableEndTimeInEditActivity}
        />
      </MissionReviewSection>
      <MissionReviewSection
        title={`${isTeamMode ? "Coéquipiers" : "En solo"}`}
        onEdit={
          changeTeam
            ? () =>
                modals.open("teamSelection", {
                  mission: mission,
                  handleContinue: changeTeam,
                  closeOnContinue: true
                })
            : null
        }
        editButtonLabel="Changer"
      >
        {isTeamMode && (
          <List dense>
            {map(teamMatesLatestStatuses, (tc, id) => (
              <ListItem disableGutters key={id}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    coworkers[tc.userId.toString()]
                      ? coworkers[tc.userId.toString()].firstName
                      : "Inconnu"
                  }
                  secondary={formatLatestEnrollmentStatus(tc)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </MissionReviewSection>
      <MissionReviewSection title="Véhicule">
        {mission.context &&
          (mission.context.vehicleId ||
            mission.context.vehicleRegistrationNumber) && (
            <List dense>
              <ListItem disableGutters>
                <ListItemIcon>
                  <DriveEtaIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    mission.context.vehicleId
                      ? getVehicleName(
                          store.getEntity("vehicles")[
                            mission.context.vehicleId.toString()
                          ]
                        )
                      : mission.context.vehicleRegistrationNumber
                  }
                />
              </ListItem>
            </List>
          )}
      </MissionReviewSection>
      {!hideExpenditures && (
        <MissionReviewSection
          title="Frais"
          onEdit={
            editExpenditures
              ? () =>
                  modals.open("expenditures", {
                    handleSubmit: (expenditures, forAllTeam) =>
                      editExpenditures(
                        expenditures,
                        mission.expenditures,
                        mission.id,
                        forAllTeam ? teamAtMissionEnd : []
                      ),
                    hasTeamMates: teamAtMissionEnd.length > 1,
                    currentExpenditures: fromPairs(
                      uniq(mission.expenditures.map(e => [e.type, true]))
                    )
                  })
              : null
          }
        >
          <Box className={`flex-row ${classes.expenditures}`}>
            {mission.expenditures &&
              uniqBy(mission.expenditures, e => e.type).map(exp => (
                <Chip key={exp.type} label={EXPENDITURES[exp.type].label} />
              ))}
          </Box>
        </MissionReviewSection>
      )}
    </AlternateColors>
  );
}
