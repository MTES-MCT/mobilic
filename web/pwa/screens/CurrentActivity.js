import React from "react";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { resolveTeamAt } from "common/utils/coworkers";
import { CurrentActivityOverview } from "../components/CurrentActivityOverview";
import { ActivityList } from "../components/ActivityList";
import { getTime } from "common/utils/events";
import { MissionReviewSection } from "../components/MissionReviewSection";

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
      team={resolveTeamAt(store, Date.now())}
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
    <MissionReviewSection
      title={`Détail de la mission${
        currentMission.name ? " : " + currentMission.name : ""
      }`}
      key={2}
      pt={5}
    >
      <ActivityList
        activities={currentMissionActivities}
        editActivityEvent={editActivityEvent}
        previousMissionEnd={0}
      />
    </MissionReviewSection>
  ];
}
