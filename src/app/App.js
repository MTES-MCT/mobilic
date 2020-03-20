import React from "react";
import { parseActivityPayloadFromBackend } from "../common/utils/activities";
import { getTime, groupActivityEventsByDay } from "../common/utils/events";
import { ScreenWithBottomNavigation } from "./utils/navigation";
import {
  ACTIVITY_CANCEL_MUTATION,
  ACTIVITY_LOG_MUTATION,
  ACTIVITY_REVISION_MUTATION,
  useApi
} from "../common/utils/api";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";

function App() {
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(Date.now()), 30000);
  }, []);

  const rawActivityEvents = storeSyncedWithLocalStorage.activities();
  const cancelledActivityIds = storeSyncedWithLocalStorage
    .pendingActivityCancels()
    .map(ac => ac.eventId);
  const activityRevisionEvents = storeSyncedWithLocalStorage.pendingActivityRevisions();
  const activityEvents = rawActivityEvents
    .filter(a => !cancelledActivityIds.includes(a.id))
    .map(a => {
      const revision = activityRevisionEvents.find(rev => rev.eventId === a.id);
      return revision ? { ...a, startTime: revision.startTime } : a;
    });

  const activityEventsByDay = groupActivityEventsByDay(activityEvents);
  const previousDaysActivityEventsByDay = activityEventsByDay.slice(
    0,
    activityEventsByDay.length - 1
  );

  const currentDayActivityEvents =
    activityEventsByDay[activityEventsByDay.length - 1];
  const currentDayExpenditures =
    currentDayActivityEvents && currentDayActivityEvents.length > 0
      ? storeSyncedWithLocalStorage
          .expenditures()
          .filter(e => getTime(e) >= getTime(currentDayActivityEvents[0]))
      : [];

  const currentActivity = activityEvents[activityEvents.length - 1];

  const pushNewActivityEvent = ({
    activityType,
    driverId = null,
    mission = currentActivity && currentActivity.mission,
    vehicleRegistrationNumber = currentActivity &&
      currentActivity.vehicleRegistrationNumber,
    startTime = null
  }) => {
    storeSyncedWithLocalStorage.pushNewActivity(
      activityType,
      mission,
      vehicleRegistrationNumber,
      driverId,
      startTime,
      () =>
        api.submitEvents(ACTIVITY_LOG_MUTATION, "activities", apiResponse => {
          const activities = apiResponse.data.logActivities.activities;
          return Promise.all([
            storeSyncedWithLocalStorage.updateAllSubmittedEvents(
              activities.map(parseActivityPayloadFromBackend),
              "activities"
            ),
            storeSyncedWithLocalStorage.updateAllSubmittedEvents(
              apiResponse.data.logActivities.teamEnrollments,
              "teamEnrollments"
            )
          ]);
        })
    );
  };

  const cancelOrReviseActivityEvent = (
    activityEvent,
    actionType,
    newStartTime = null
  ) => {
    if (activityEvent.isBeingSubmitted) return;
    // If the event was not submitted yet we can directly alter its value in the store, with no need for an API call
    if (!activityEvent.id) {
      storeSyncedWithLocalStorage.removeEvent(activityEvent, "activities");
      if (actionType === "revision") {
        storeSyncedWithLocalStorage.pushEvent(
          { ...activityEvent, eventTime: newStartTime },
          "activities"
        );
      }
    } else {
      if (actionType === "revision") {
        const pendingRevisionForActivity = storeSyncedWithLocalStorage
          .pendingActivityRevisions()
          .find(rev => rev.eventId === activityEvent.id);
        // If a revision is currently being submitted for the same event, abort
        if (pendingRevisionForActivity) {
          if (pendingRevisionForActivity.isBeingSubmitted) return;
          storeSyncedWithLocalStorage.removeEvent(
            pendingRevisionForActivity,
            "pendingActivityRevisions"
          );
        }
        storeSyncedWithLocalStorage.pushNewActivityRevision(
          activityEvent.id,
          newStartTime,
          () => {
            api.submitEvents(
              ACTIVITY_REVISION_MUTATION,
              "pendingActivityRevisions",
              apiResponse => {
                const activities = apiResponse.data.reviseActivities.activities;
                return Promise.all([
                  storeSyncedWithLocalStorage.updateAllSubmittedEvents(
                    activities.map(parseActivityPayloadFromBackend),
                    "activities"
                  ),
                  storeSyncedWithLocalStorage.updateAllSubmittedEvents(
                    [],
                    "pendingActivityRevisions"
                  )
                ]);
              }
            );
          }
        );
      } else {
        // Remove revisions of the event that are pending, since the event will be cancelled anyway
        const pendingRevisionForActivity = storeSyncedWithLocalStorage
          .pendingActivityRevisions()
          .find(rev => rev.eventId === activityEvent.id);
        if (pendingRevisionForActivity) {
          storeSyncedWithLocalStorage.removeEvent(
            pendingRevisionForActivity,
            "pendingActivityRevisions"
          );
        }
        storeSyncedWithLocalStorage.pushNewActivityCancel(
          activityEvent.id,
          () => {
            api.submitEvents(
              ACTIVITY_CANCEL_MUTATION,
              "pendingActivityCancels",
              apiResponse => {
                const activities = apiResponse.data.cancelActivities.activities;
                return Promise.all([
                  storeSyncedWithLocalStorage.updateAllSubmittedEvents(
                    activities.map(parseActivityPayloadFromBackend),
                    "activities"
                  ),
                  storeSyncedWithLocalStorage.updateAllSubmittedEvents(
                    [],
                    "pendingActivityCancels"
                  )
                ]);
              }
            );
          }
        );
      }
    }
  };

  return (
    <ScreenWithBottomNavigation
      currentTime={currentTime}
      currentActivity={currentActivity}
      currentDayActivityEvents={currentDayActivityEvents}
      pushNewActivityEvent={pushNewActivityEvent}
      cancelOrReviseActivityEvent={cancelOrReviseActivityEvent}
      previousDaysActivityEventsByDay={previousDaysActivityEventsByDay}
      currentDayExpenditures={currentDayExpenditures}
    />
  );
}

export default App;
