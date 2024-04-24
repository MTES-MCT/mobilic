import React from "react";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { resolveTeamAt } from "common/utils/coworkers";
import { CurrentActivityOverview } from "../components/CurrentActivityOverview";
import { MissionDetails } from "../components/MissionDetails";
import Box from "@mui/material/Box";
import {
  ACTIVITIES,
  ACTIVITIES_OPERATIONS,
  getCurrentActivityDuration
} from "common/utils/activities";
import { now } from "common/utils/time";
import WarningEndMissionModalContainer from "../components/WarningEndMissionModal/WarningEndMissionModalContainer";
import { useModals } from "common/utils/modals";
import Alert from "@mui/material/Alert";
import { missionLastLessThanAMinute } from "common/utils/mission";

export function CurrentActivity({
  latestActivity,
  currentMission,
  pushNewTeamActivityEvent,
  updateMissionVehicle,
  registerKilometerReading,
  editActivityEvent,
  editVehicle,
  endMission,
  previousMissionEnd,
  openEndMissionModal
}) {
  const currentTeam = resolveTeamAt(currentMission.teamChanges, now());
  const modals = useModals();

  const setCurrentTime = React.useState(now())[1];
  // We force re-rendering every X sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(now()), 30000);
  }, []);

  const beginBreak = async () => {
    await editActivityEvent(
      latestActivity,
      ACTIVITIES_OPERATIONS.update,
      latestActivity.startTime,
      now(),
      null,
      !currentMission.submittedBySomeoneElse
    );
  };

  const beginBreakIfPossible = async () => {
    if (missionLastLessThanAMinute(currentMission)) {
      modals.open("confirmation", {
        textButtons: true,
        content: (
          <Alert severity="warning">
            La première activité ayant duré moins d'une minute, passer en pause
            maintenant annulera votre mission en cours.
          </Alert>
        ),
        title: "Confirmer la pause",
        handleConfirm: beginBreak
      });
    } else {
      await beginBreak();
    }
  };

  return [
    <CurrentActivityOverview
      key={0}
      currentDayStart={currentMission.startTime}
      currentMission={currentMission}
      latestActivity={latestActivity}
    />,
    <ActivitySwitch
      key={1}
      team={currentTeam}
      latestActivity={latestActivity}
      pushActivitySwitchEvent={async (
        activityType,
        driverId = null,
        vehicle = null,
        kilometerReading = null
      ) =>
        activityType === ACTIVITIES.break.name
          ? beginBreakIfPossible()
          : await Promise.all([
              vehicle
                ? updateMissionVehicle({ mission: currentMission, vehicle })
                : Promise.resolve(null),
              kilometerReading && currentMission.startLocation
                ? registerKilometerReading({
                    mission: currentMission,
                    location: currentMission.startLocation,
                    isStart: true,
                    kilometerReading
                  })
                : null,
              pushNewTeamActivityEvent({
                activityType,
                driverId,
                missionId: currentMission.id,
                team: currentMission.submittedBySomeoneElse ? [] : currentTeam,
                startTime: now()
              })
            ])
      }
      endMission={endTime => {
        openEndMissionModal({
          mission: currentMission,
          team: currentTeam,
          missionEndTime: endTime,
          latestActivityEndOrStartTime:
            latestActivity.endTime || latestActivity.startTime
        });
      }}
      requireVehicle={!currentMission.vehicle}
      company={currentMission.company}
    />,
    <Box key={2} pt={3} />,
    <MissionDetails
      key={3}
      mission={currentMission}
      editActivityEvent={editActivityEvent}
      hideExpenditures
      hideValidations
      hideComments
      editVehicle={vehicle => editVehicle({ mission: currentMission, vehicle })}
      previousMissionEnd={previousMissionEnd}
      createActivity={args =>
        pushNewTeamActivityEvent({ ...args, switchMode: false })
      }
      changeTeam={updatedCoworkers =>
        updatedCoworkers.forEach(cw => {
          if (cw.enroll) {
            pushNewTeamActivityEvent({
              activityType: latestActivity ? latestActivity.type : null,
              missionId: currentMission.id,
              startTime: now(),
              team: [cw.id],
              driverId: -1
            });
          } else {
            endMission({
              endTime: now(),
              mission: currentMission,
              userId: cw.id
            });
          }
        })
      }
      isMissionEnded={false}
      editKilometerReading={registerKilometerReading}
      headingLevel="h2"
    />,
    <WarningEndMissionModalContainer
      key={4}
      currentMission={currentMission}
      currentTeam={currentTeam}
      latestActivity={latestActivity}
      openEndMissionModal={openEndMissionModal}
      activityDuration={getCurrentActivityDuration(latestActivity)}
    />
  ];
}
