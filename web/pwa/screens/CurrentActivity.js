import React from "react";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { resolveTeamAt } from "common/utils/coworkers";
import { CurrentActivityOverview } from "../components/CurrentActivityOverview";
import { getTime } from "common/utils/events";
import { MissionDetails } from "../components/MissionDetails";
import Box from "@material-ui/core/Box";

export function CurrentActivity({
  currentActivity,
  currentMission,
  pushNewActivityEvent,
  editActivityEvent,
  pushNewVehicleBooking,
  pushNewTeamEnrollmentOrRelease,
  endMission,
  previousMissionEnd
}) {
  const currentTeam = resolveTeamAt(currentMission.teamChanges, Date.now());

  return [
    <CurrentActivityOverview
      key={0}
      currentDayStart={getTime(currentMission.activities[0])}
      currentActivity={currentActivity}
    />,
    <ActivitySwitch
      key={1}
      team={currentTeam}
      currentActivity={currentActivity}
      pushActivitySwitchEvent={(activityType, driver = null) =>
        pushNewActivityEvent({
          activityType,
          driver,
          missionId: currentMission.id
        })
      }
      endMission={args => endMission({ missionId: currentMission.id, ...args })}
    />,
    <Box key={2} pt={3} />,
    <MissionDetails
      key={3}
      mission={currentMission}
      editActivityEvent={editActivityEvent}
      hideExpenditures
      previousMissionEnd={previousMissionEnd}
      createActivity={pushNewActivityEvent}
      changeVehicle={(vehicle, bookingTime) =>
        pushNewVehicleBooking(vehicle, bookingTime, currentMission.id)
      }
      changeTeam={updatedCoworkers =>
        updatedCoworkers.forEach(cw => {
          pushNewTeamEnrollmentOrRelease(
            cw.id,
            cw.firstName,
            cw.lastName,
            cw.enroll,
            currentMission.id
          );
        })
      }
    />
  ];
}
