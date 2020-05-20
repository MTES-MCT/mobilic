import { MissionReviewSection } from "./MissionReviewSection";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import { ActivityList } from "./ActivityList";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {
  computeLatestEnrollmentStatuses,
  formatLatestEnrollmentStatus
} from "common/utils/coworkers";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import { EXPENDITURES } from "common/utils/expenditures";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";
import { getTime } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { formatVehicleBookingTimes } from "common/utils/vehicles";
import { ACTIVITIES } from "common/utils/activities";
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
  editExpenditures,
  previousMissionEnd,
  hideExpenditures,
  createActivity,
  changeTeam,
  changeVehicle
}) {
  const classes = useStyles();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const userId = store.userId();

  const lastMissionActivity = mission.activities[mission.activities.length - 1];
  const lastVehicleBooking =
    mission.vehicleBookings.length > 0
      ? mission.vehicleBookings[mission.vehicleBookings.length - 1]
      : null;
  const vehicleBookingsWithEndTime = mission.vehicleBookings.map(
    (vb, index) => ({
      ...vb,
      endTime:
        index < mission.vehicleBookings.length - 1
          ? getTime(mission.vehicleBookings[index + 1])
          : null
    })
  );

  let teamChanges = mission.teamChanges.filter(tc => tc.coworker.id !== userId);
  // Do not include the automatic releases of all team mates at mission end
  if (mission.isComplete) {
    teamChanges = teamChanges.filter(
      tc =>
        tc.isEnrollment ||
        getTime(tc) !==
          getTime(mission.activities[mission.activities.length - 1])
    );
  }

  const teamMatesLatestStatuses = computeLatestEnrollmentStatuses(teamChanges);

  const isTeamMode = teamMatesLatestStatuses.length > 0;

  return (
    <AlternateColors>
      <MissionReviewSection
        title="Activités"
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
                    : Date.now(),
                  teamChanges
                })
            : null
        }
      >
        <ActivityList
          activities={mission.activities}
          editActivityEvent={editActivityEvent}
          missionEnd={
            lastMissionActivity.type === ACTIVITIES.rest.name
              ? getTime(lastMissionActivity)
              : null
          }
          previousMissionEnd={previousMissionEnd}
          teamChanges={teamChanges}
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
            {teamMatesLatestStatuses.map((tc, index) => (
              <ListItem disableGutters key={index}>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary={tc.coworker.firstName}
                  secondary={formatLatestEnrollmentStatus(tc)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </MissionReviewSection>
      <MissionReviewSection
        title="Véhicules"
        onEdit={
          changeVehicle
            ? () =>
                modals.open("vehicleBooking", {
                  currentVehicleBooking: lastVehicleBooking,
                  handleContinue: changeVehicle
                })
            : null
        }
        editButtonLabel="Changer"
      >
        {mission.vehicleBookings.length > 0 && (
          <List dense>
            {vehicleBookingsWithEndTime.reverse().map((vb, index) => (
              <ListItem disableGutters key={index}>
                <ListItemIcon>
                  <DriveEtaIcon />
                </ListItemIcon>
                <ListItemText
                  primary={vb.vehicleName}
                  secondary={formatVehicleBookingTimes(vb, vb.endTime)}
                />
              </ListItem>
            ))}
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
      )}
    </AlternateColors>
  );
}
