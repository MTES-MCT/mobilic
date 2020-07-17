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
  pushNewTeamActivityEvent,
  editActivityEvent,
  endMissionForTeam,
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
      pushActivitySwitchEvent={(activityType, driverId = null) =>
        pushNewTeamActivityEvent({
          activityType,
          driverId,
          missionId: currentMission.id,
          team: currentTeam,
          startTime: Date.now()
        })
      }
      endMission={args =>
        endMissionForTeam({
          missionId: currentMission.id,
          team: currentTeam,
          ...args
        })
      }
    />,
    <Box key={2} pt={3} />,
    <MissionDetails
      key={3}
      mission={currentMission}
      editActivityEvent={editActivityEvent}
      hideExpenditures
      previousMissionEnd={previousMissionEnd}
      createActivity={pushNewTeamActivityEvent}
      changeTeam={updatedCoworkers =>
        updatedCoworkers.forEach(cw => {
          if (cw.enroll) {
            pushNewTeamActivityEvent({
              activityType: currentActivity ? currentActivity.type : null,
              missionId: currentMission.id,
              startTime: Date.now(),
              team: [cw.id],
              driverId: -1
            });
          } else {
            endMission({
              endTime: Date.now(),
              missionId: currentMission.id,
              userId: cw.id
            });
          }
        })
      }
    />
  ];
}
