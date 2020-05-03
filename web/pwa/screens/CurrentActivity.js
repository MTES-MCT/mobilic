import React from "react";
import { TimeLine } from "../components/Timeline";
import { ActivitySwitchGrid } from "../components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import { computeTotalActivityDurations } from "common/utils/metrics";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { resolveTeam } from "common/utils/coworkers";
import {ACTIVITIES} from "common/utils/activities";

export function CurrentActivity({
  currentActivity,
  currentDayActivityEvents,
  pushNewActivityEvent,
  editActivityEvent,
  endMission
}) {
  const store = useStoreSyncedWithLocalStorage();

  const timers = computeTotalActivityDurations(
    currentDayActivityEvents,
    Date.now() + 1
  );

  return (
    <Container
      className="activity-switch-container full-height space-between"
      maxWidth={false}
    >
      <TimeLine
        dayActivityEvents={currentDayActivityEvents}
        editActivityEvent={editActivityEvent}
        pushNewActivityEvent={pushNewActivityEvent}
      />
      <Divider className="full-width-divider" />
      <ActivitySwitchGrid
        timers={timers}
        team={resolveTeam(store)}
        currentActivity={currentActivity}
        pushActivitySwitchEvent={(activityType, driver = null) =>
          activityType === ACTIVITIES.rest.name
            ? endMission()
            : pushNewActivityEvent({ activityType, driver })
        }
      />
    </Container>
  );
}
