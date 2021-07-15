import React from "react";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { resolveTeamAt } from "common/utils/coworkers";
import { CurrentActivityOverview } from "../components/CurrentActivityOverview";
import { getTime } from "common/utils/events";
import { MissionDetails } from "../components/MissionDetails";
import Box from "@material-ui/core/Box";
import { ACTIVITIES } from "common/utils/activities";
import { now } from "common/utils/time";

export function CurrentActivity({
  latestActivity,
  currentMission,
  pushNewTeamActivityEvent,
  updateMissionVehicle,
  registerKilometerReading,
  editActivityEvent,
  editVehicle,
  endMissionForTeam,
  endMission,
  previousMissionEnd
}) {
  const currentTeam = resolveTeamAt(currentMission.teamChanges, now());

  const setCurrentTime = React.useState(now())[1];
  // We force re-rendering every X sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(now()), 30000);
  }, []);

  return [
    <CurrentActivityOverview
      key={0}
      currentDayStart={getTime(currentMission.activities[0])}
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
          ? await editActivityEvent(
              latestActivity,
              "revision",
              getTime(latestActivity),
              now(),
              null,
              !currentMission.submittedBySomeoneElse
            )
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
      endMission={async args =>
        await endMissionForTeam({
          mission: currentMission,
          team: currentMission.submittedBySomeoneElse ? [] : currentTeam,
          ...args
        })
      }
      currentMission={currentMission}
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
    />
  ];
}
