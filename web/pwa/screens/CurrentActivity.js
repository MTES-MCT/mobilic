import React from "react";
import { TimeLine } from "../components/Timeline";
import { ActivitySwitchGrid } from "../components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import { computeTotalActivityDurations } from "common/utils/metrics";
import { Expenditures } from "../components/Expenditures";
import Divider from "@material-ui/core/Divider";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { resolveTeamAt } from "common/utils/coworkers";

export function CurrentActivity({
  currentActivity,
  currentDayActivityEvents,
  pushNewActivityEvent,
  currentDayExpenditures,
  cancelOrReviseActivityEvent,
  pushNewExpenditure,
  cancelExpenditure
}) {
  const store = useStoreSyncedWithLocalStorage();

  const timers = computeTotalActivityDurations(
    currentDayActivityEvents,
    Date.now() + 1
  );

  const pendingExpenditureCancels = storeSyncedWithLocalStorage.pendingExpenditureCancels();

  return (
    <Container
      className="activity-switch-container full-height space-between"
      maxWidth={false}
    >
      <TimeLine
        dayActivityEvents={currentDayActivityEvents}
        cancelOrReviseActivityEvent={cancelOrReviseActivityEvent}
        pushNewActivityEvent={pushNewActivityEvent}
      />
      <Divider className="full-width-divider" />
      <ActivitySwitchGrid
        timers={timers}
        team={resolveTeamAt(Date.now(), storeSyncedWithLocalStorage)}
        currentActivity={currentActivity}
        pushActivitySwitchEvent={(activityType, driverId = null) =>
          pushNewActivityEvent({ activityType, driverId })
        }
      />
      <Divider className="full-width-divider" />
      <Expenditures
        expenditures={currentDayExpenditures.filter(
          e => !pendingExpenditureCancels.map(ec => ec.eventId).includes(e.id)
        )}
        pushNewExpenditure={pushNewExpenditure(
          currentDayExpenditures,
          pendingExpenditureCancels
        )}
        cancelExpenditure={cancelExpenditure}
      />
    </Container>
  );
}
