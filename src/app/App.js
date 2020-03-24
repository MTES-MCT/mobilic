import React from "react";
import {
  ACTIVITIES,
  parseActivityPayloadFromBackend
} from "../common/utils/activities";
import {
  getTime,
  groupActivityEventsByDay,
  sortEvents
} from "../common/utils/events";
import { ScreenWithBottomNavigation } from "./utils/navigation";
import {
  ACTIVITY_CANCEL_MUTATION,
  ACTIVITY_LOG_MUTATION,
  ACTIVITY_REVISION_MUTATION,
  MISSION_LOG_MUTATION,
  TEAM_ENROLLMENT_LOG_MUTATION,
  useApi
} from "../common/utils/api";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";
import { resolveTeamAt } from "../common/utils/coworkers";

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
    .filter(a => !cancelledActivityIds.includes(a.id) && !a.isHidden)
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

  const missions = sortEvents(storeSyncedWithLocalStorage.missions()).reverse();
  const currentMission = currentDayActivityEvents
    ? missions.find(m => getTime(m) >= getTime(currentDayActivityEvents[0]))
    : null;

  const pushNewActivityEvent = async ({
    activityType,
    driverId = null,
    mission = null,
    vehicleRegistrationNumber = null,
    startTime = null
  }) => {
    if (activityType === ACTIVITIES.rest.name && startTime === null) {
      const team = resolveTeamAt(Date.now(), storeSyncedWithLocalStorage);
      team.forEach(tm =>
        storeSyncedWithLocalStorage.pushEvent(
          {
            type: "remove",
            userId: tm.id,
            firstName: tm.firstName,
            lastName: tm.lastName,
            eventTime: Date.now(),
            isPrediction: true
          },
          "teamEnrollments"
        )
      );
    }
    const newActivity = {
      type: activityType,
      eventTime: Date.now()
    };
    if (driverId !== undefined && driverId !== null)
      newActivity.driverId = driverId;
    if (startTime !== undefined && startTime !== null)
      newActivity.startTime = startTime;
    if (mission !== undefined && mission !== null)
      newActivity.mission = mission;
    if (
      vehicleRegistrationNumber !== undefined &&
      vehicleRegistrationNumber !== null
    )
      newActivity.vehicleRegistrationNumber = vehicleRegistrationNumber;
    await this.pushEvent(newActivity, "activities");

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
        ),
        storeSyncedWithLocalStorage.updateAllSubmittedEvents(
          apiResponse.data.logActivities.missions,
          "missions"
        )
      ]);
    });
  };

  const cancelOrReviseActivityEvent = async (
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
        await storeSyncedWithLocalStorage.pushEvent(
          {
            eventId: activityEvent.id,
            startTime: newStartTime,
            eventTime: Date.now()
          },
          "pendingActivityRevisions"
        );
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
        await storeSyncedWithLocalStorage.pushEvent(
          {
            eventId: activityEvent.id,
            eventTime: Date.now()
          },
          "pendingActivityCancels"
        );
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
    }
  };

  const pushNewTeamEnrollment = async (
    enrollType,
    userId,
    firstName,
    lastName
  ) => {
    await storeSyncedWithLocalStorage.pushEvent(
      {
        type: enrollType,
        userId,
        firstName,
        lastName,
        eventTime: Date.now()
      },
      "teamEnrollments"
    );
    return api.submitEvents(
      TEAM_ENROLLMENT_LOG_MUTATION,
      "teamEnrollments",
      apiResponse => {
        const coworkers =
          apiResponse.data.logTeamEnrollments.enrollableCoworkers;
        const teamEnrollments =
          apiResponse.data.logTeamEnrollments.teamEnrollments;
        return Promise.all([
          storeSyncedWithLocalStorage.updateAllSubmittedEvents(
            coworkers,
            "coworkers"
          ),
          storeSyncedWithLocalStorage.updateAllSubmittedEvents(
            teamEnrollments,
            "teamEnrollments"
          )
        ]);
      }
    );
  };

  const pushNewMission = async (name, startTime) => {
    const eventTime = Date.now();
    const event = {
      name,
      eventTime
    };
    // If startTime is far enough from the current time we consider that the user intently set its value.
    // Otherwise it's simply the current time at modal opening
    if (eventTime - startTime > 60000) event.startTime = startTime;
    await storeSyncedWithLocalStorage.pushEvent(event, "missions");

    api.submitEvents(MISSION_LOG_MUTATION, "missions", apiResponse =>
      storeSyncedWithLocalStorage.updateAllSubmittedEvents(
        apiResponse.data.logMissions.missions,
        "missions"
      )
    );
  };

  return (
    <ScreenWithBottomNavigation
      currentTime={currentTime}
      currentActivity={currentActivity}
      currentDayActivityEvents={currentDayActivityEvents}
      currentMission={currentMission}
      pushNewActivityEvent={pushNewActivityEvent}
      cancelOrReviseActivityEvent={cancelOrReviseActivityEvent}
      previousDaysActivityEventsByDay={previousDaysActivityEventsByDay}
      currentDayExpenditures={currentDayExpenditures}
      pushNewTeamEnrollment={pushNewTeamEnrollment}
      pushNewMission={pushNewMission}
    />
  );
}

export default App;
