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
  editActivityEvent,
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
      pushActivitySwitchEvent={async (activityType, driverId = null) =>
        activityType === ACTIVITIES.break.name
          ? await editActivityEvent(
              latestActivity,
              "revision",
              getTime(latestActivity),
              now(),
              null,
              true
            )
          : await pushNewTeamActivityEvent({
              activityType,
              driverId,
              missionActivities: currentMission.allActivities,
              missionId: currentMission.id,
              team: currentTeam,
              startTime: now()
            })
      }
      endMission={async args =>
        await endMissionForTeam({
          mission: currentMission,
          team: currentTeam,
          ...args
        })
      }
      currentMission={currentMission}
    />,
    <Box key={2} pt={3} />,
    <MissionDetails
      key={3}
      mission={currentMission}
      editActivityEvent={editActivityEvent}
      hideExpenditures
      hideValidations
      hideComments
      previousMissionEnd={previousMissionEnd}
      createActivity={args =>
        pushNewTeamActivityEvent({ ...args, switchMode: false })
      }
      changeTeam={updatedCoworkers =>
        updatedCoworkers.forEach(cw => {
          if (cw.enroll) {
            pushNewTeamActivityEvent({
              missionActivities: currentMission.allActivities,
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
    />
  ];
}
