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
  useApi,
  VEHICLE_BOOKING_LOG_MUTATION
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
      return revision ? { ...a, userTime: revision.userTime } : a;
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
  let firstActivityOfCurrentOrLatestDay;
  if (currentDayActivityEvents && currentDayActivityEvents.length > 0) {
    firstActivityOfCurrentOrLatestDay = currentDayActivityEvents[0];
  } else if (
    previousDaysActivityEventsByDay &&
    previousDaysActivityEventsByDay.length > 0
  ) {
    firstActivityOfCurrentOrLatestDay =
      previousDaysActivityEventsByDay[
        previousDaysActivityEventsByDay.length - 1
      ][0];
  }

  const missions = sortEvents(storeSyncedWithLocalStorage.missions()).reverse();
  const currentOrLatestDayMission = firstActivityOfCurrentOrLatestDay
    ? missions.find(
        m => getTime(m) >= getTime(firstActivityOfCurrentOrLatestDay)
      )
    : null;

  const vehicleBookings = sortEvents(
    storeSyncedWithLocalStorage.vehicleBookings()
  ).reverse();
  const currentOrLatestDayVehicleBooking = firstActivityOfCurrentOrLatestDay
    ? vehicleBookings.find(
        vb => getTime(vb) >= getTime(firstActivityOfCurrentOrLatestDay)
      )
    : null;

  const pushNewActivityEvent = async ({
    activityType,
    driverId = null,
    mission = null,
    vehicleRegistrationNumber = null,
    userTime = null
  }) => {
    if (activityType === ACTIVITIES.rest.name && userTime === null) {
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
    if (userTime !== undefined && userTime !== null)
      newActivity.userTime = userTime;
    if (mission !== undefined && mission !== null)
      newActivity.mission = mission;
    if (
      vehicleRegistrationNumber !== undefined &&
      vehicleRegistrationNumber !== null
    )
      newActivity.vehicleRegistrationNumber = vehicleRegistrationNumber;
    await storeSyncedWithLocalStorage.pushEvent(newActivity, "activities");

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
        ),
        storeSyncedWithLocalStorage.updateAllSubmittedEvents(
          apiResponse.data.logActivities.vehicleBookings,
          "vehicleBookings"
        )
      ]);
    });
  };

  const cancelOrReviseActivityEvent = async (
    activityEvent,
    actionType,
    newUserTime = null,
    userComment = null
  ) => {
    if (activityEvent.isBeingSubmitted) return;
    // If the event was not submitted yet we can directly alter its value in the store, with no need for an API call
    if (!activityEvent.id) {
      storeSyncedWithLocalStorage.removeEvent(activityEvent, "activities");
      if (actionType === "revision") {
        storeSyncedWithLocalStorage.pushEvent(
          { ...activityEvent, eventTime: newUserTime },
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
        const event = {
          eventId: activityEvent.id,
          userTime: newUserTime,
          eventTime: Date.now()
        };
        if (userComment !== undefined && userComment !== null)
          event.comment = userComment;
        await storeSyncedWithLocalStorage.pushEvent(
          event,
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
        const event = {
          eventId: activityEvent.id,
          eventTime: Date.now()
        };
        if (userComment !== undefined && userComment !== null)
          event.comment = userComment;
        await storeSyncedWithLocalStorage.pushEvent(
          event,
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

  const pushNewMission = async (name, userTime) => {
    const eventTime = Date.now();
    const event = {
      name,
      eventTime
    };
    // If userTime is far enough from the current time we consider that the user intently set its value.
    // Otherwise it's simply the current time at modal opening
    if (eventTime - userTime > 60000) event.userTime = userTime;
    await storeSyncedWithLocalStorage.pushEvent(event, "missions");

    api.submitEvents(MISSION_LOG_MUTATION, "missions", apiResponse =>
      storeSyncedWithLocalStorage.updateAllSubmittedEvents(
        apiResponse.data.logMissions.missions,
        "missions"
      )
    );
  };

  const pushNewVehicleBooking = async (registrationNumber, userTime) => {
    const eventTime = Date.now();
    const event = {
      registrationNumber,
      eventTime
    };
    // If userTime is far enough from the current time we consider that the user intently set its value.
    // Otherwise it's simply the current time at modal opening
    if (eventTime - userTime > 60000) event.userTime = userTime;
    await storeSyncedWithLocalStorage.pushEvent(event, "vehicleBookings");

    api.submitEvents(
      VEHICLE_BOOKING_LOG_MUTATION,
      "vehicleBookings",
      apiResponse =>
        storeSyncedWithLocalStorage.updateAllSubmittedEvents(
          apiResponse.data.logVehicleBookings.vehicleBookings,
          "vehicleBookings"
        )
    );
  };

  return (
    <ScreenWithBottomNavigation
      currentTime={currentTime}
      currentActivity={currentActivity}
      currentDayActivityEvents={currentDayActivityEvents}
      currentOrLatestDayMission={currentOrLatestDayMission}
      currentOrLatestDayVehicleBooking={currentOrLatestDayVehicleBooking}
      pushNewActivityEvent={pushNewActivityEvent}
      cancelOrReviseActivityEvent={cancelOrReviseActivityEvent}
      previousDaysActivityEventsByDay={previousDaysActivityEventsByDay}
      currentDayExpenditures={currentDayExpenditures}
      pushNewTeamEnrollment={pushNewTeamEnrollment}
      pushNewMission={pushNewMission}
      pushNewVehicleBooking={pushNewVehicleBooking}
    />
  );
}

export default App;
