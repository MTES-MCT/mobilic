import React from "react";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { resolveTeamAt } from "common/utils/coworkers";
import { CurrentActivityOverview } from "../components/CurrentActivityOverview";
import { getTime } from "common/utils/events";
import { MissionDetails } from "../components/MissionDetails";
import Box from "@material-ui/core/Box";

export function CurrentActivity({
  currentActivity,
  currentMission,
  currentMissionActivities,
  pushNewActivityEvent,
  editActivityEvent,
  endMission
}) {
  const store = useStoreSyncedWithLocalStorage();

  const team = resolveTeamAt(store, Date.now());

  return [
    <CurrentActivityOverview
      key={0}
      currentDayStart={getTime(currentMissionActivities[0])}
      currentActivity={currentActivity}
    />,
    <ActivitySwitch
      key={1}
      team={team}
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
      missionActivities={currentMissionActivities}
      team={team}
      editActivityEvent={editActivityEvent}
      hideExpenditures
      previousMissionEnd={0}
      createActivity={pushNewActivityEvent}
    />
  ];
}
