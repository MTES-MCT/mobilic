import React from "react";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { resolveTeam } from "common/utils/coworkers";
import { CurrentActivityOverview } from "../components/CurrentActivityOverview";
import { ActivityList } from "../components/ActivityList";
import { getTime } from "common/utils/events";

export function CurrentActivity({
  currentActivity,
  currentMission,
  currentDayActivityEvents,
  currentMissionActivities,
  pushNewActivityEvent,
  editActivityEvent,
  endMission
}) {
  const store = useStoreSyncedWithLocalStorage();

  return [
    <CurrentActivityOverview
      key={0}
      currentDayStart={getTime(currentDayActivityEvents[0])}
      currentActivity={currentActivity}
    />,
    <ActivitySwitch
      key={1}
      team={resolveTeam(store)}
      currentActivity={currentActivity}
      pushActivitySwitchEvent={(activityType, driver = null) =>
        pushNewActivityEvent({
          activityType,
          driver,
          missionId: currentMission.id
        })
      }
      endMission={endMission}
    />,
    <ActivityList
      key={2}
      mission={currentMission}
      activities={currentMissionActivities}
      editActivityEvent={editActivityEvent}
      previousMissionEnd={0}
    />
  ];
}
