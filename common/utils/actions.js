import React from "react";
import { useStoreSyncedWithLocalStorage } from "./store";
import {
  ACTIVITY_CANCEL_MUTATION,
  ACTIVITY_LOG_MUTATION,
  ACTIVITY_REVISION_MUTATION,
  COMMENT_LOG_MUTATION,
  EXPENDITURE_CANCEL_MUTATION,
  EXPENDITURE_LOG_MUTATION,
  MISSION_LOG_MUTATION,
  TEAM_ENROLLMENT_LOG_MUTATION,
  useApi,
  VEHICLE_BOOKING_LOG_MUTATION
} from "./api";
import { ACTIVITIES, parseActivityPayloadFromBackend } from "./activities";
import { syncUser } from "./loadUserData";
import { resolveTeamAt } from "./coworkers";
import { parseExpenditureFromBackend } from "./expenditures";

const ActionsContext = React.createContext(() => {});

export function ActionsContextProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();

  async function submitAction(query, variables, optimisticStoreUpdate, watchFields, handleSubmitResponse) {
    // 1. Store the request and optimistically update the store as if the api responded successfully
    const request = await store.newRequest(query, variables, optimisticStoreUpdate, watchFields, handleSubmitResponse);

    // 2. Execute the request (call API) along with any other pending one
    // await api.nonConcurrentQueryQueue.execute(() => api.executeRequest(request));
    await api.executePendingRequests();
  }

  const pushNewActivityEvent = async ({
    activityType,
    driverId = null,
    mission = null,
    vehicleId = null,
    vehicleRegistrationNumber = null,
    userTime = null,
    userComment = null
  }) => {
    if (activityType === ACTIVITIES.rest.name && userTime === null) {
      const team = resolveTeamAt(Date.now(), store);
      team.forEach(tm =>
        store.pushEvent(
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
    if (userComment !== undefined && userComment !== null)
      newActivity.comment = userComment;
    if (vehicleId !== undefined && vehicleId !== null)
      newActivity.vehicleId = vehicleId;
    if (
      vehicleRegistrationNumber !== undefined &&
      vehicleRegistrationNumber !== null
    )
      newActivity.vehicleRegistrationNumber = vehicleRegistrationNumber;
    await store.pushEvent(newActivity, "activities");

    api.submitEvents(ACTIVITY_LOG_MUTATION, "activities", apiResponse => {
      const user = apiResponse.data.logActivities.user;
      return syncUser(user, store);
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
      store.removeEvent(activityEvent, "activities");
      if (actionType === "revision") {
        store.pushEvent(
          { ...activityEvent, eventTime: newUserTime },
          "activities"
        );
      }
    } else {
      if (actionType === "revision") {
        const pendingRevisionForActivity = store
          .pendingActivityRevisions()
          .find(rev => rev.eventId === activityEvent.id);
        // If a revision is currently being submitted for the same event, abort
        if (pendingRevisionForActivity) {
          if (pendingRevisionForActivity.isBeingSubmitted) return;
          store.removeEvent(
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
        await store.pushEvent(event, "pendingActivityRevisions");
        api.submitEvents(
          ACTIVITY_REVISION_MUTATION,
          "pendingActivityRevisions",
          apiResponse => {
            const activities = apiResponse.data.reviseActivities.activities;
            return Promise.all([
              store.updateAllSubmittedEvents(
                activities.map(parseActivityPayloadFromBackend),
                "activities"
              ),
              store.updateAllSubmittedEvents([], "pendingActivityRevisions")
            ]);
          }
        );
      } else {
        // Remove revisions of the event that are pending, since the event will be cancelled anyway
        const pendingRevisionForActivity = store
          .pendingActivityRevisions()
          .find(rev => rev.eventId === activityEvent.id);
        if (pendingRevisionForActivity) {
          store.removeEvent(
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
        await store.pushEvent(event, "pendingActivityCancels");
        api.submitEvents(
          ACTIVITY_CANCEL_MUTATION,
          "pendingActivityCancels",
          apiResponse => {
            const activities = apiResponse.data.cancelActivities.activities;
            return Promise.all([
              store.updateAllSubmittedEvents(
                activities.map(parseActivityPayloadFromBackend),
                "activities"
              ),
              store.updateAllSubmittedEvents([], "pendingActivityCancels")
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
    await store.pushEvent(
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
          store.updateAllSubmittedEvents(coworkers, "coworkers"),
          store.updateAllSubmittedEvents(teamEnrollments, "teamEnrollments")
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
    await store.pushEvent(event, "missions");

    api.submitEvents(MISSION_LOG_MUTATION, "missions", apiResponse =>
      store.updateAllSubmittedEvents(
        apiResponse.data.logMissions.missions,
        "missions"
      )
    );
  };

  const pushNewVehicleBooking = async (vehicle, userTime) => {
    if (!vehicle) return;
    const { id, registrationNumber } = vehicle;
    const eventTime = Date.now();
    const event = {
      eventTime
    };
    if (id !== undefined && id !== null) event.vehicleId = id;
    if (registrationNumber !== undefined && registrationNumber !== null)
      event.registrationNumber = registrationNumber;

    // If userTime is far enough from the current time we consider that the user intently set its value.
    // Otherwise it's simply the current time at modal opening
    if (eventTime - userTime > 60000) event.userTime = userTime;
    await store.pushEvent(event, "vehicleBookings");

    api.submitEvents(
      VEHICLE_BOOKING_LOG_MUTATION,
      "vehicleBookings",
      apiResponse => {
        store.updateAllSubmittedEvents(
          apiResponse.data.logVehicleBookings.vehicleBookings,
          "vehicleBookings"
        );
        store.updateAllSubmittedEvents(
          apiResponse.data.logVehicleBookings.bookableVehicles,
          "vehicles"
        );
      }
    );
  };

  const pushNewComment = async content => {
    await store.pushEvent(
      {
        content,
        eventTime: Date.now()
      },
      "comments"
    );
    api.submitEvents(COMMENT_LOG_MUTATION, "comments", apiResponse => {
      const comments = apiResponse.data.logComments.comments;
      return store.updateAllSubmittedEvents(comments, "comments");
    });
  };

  const pushNewExpenditure = (
    currentDayExpenditures,
    pendingExpenditureCancels
  ) => async expenditureType => {
    const expenditureMatch = currentDayExpenditures.find(
      e => e.type === expenditureType
    );
    let expenditureCancel = null;
    if (expenditureMatch) {
      expenditureCancel = pendingExpenditureCancels.find(
        e => e.eventId === expenditureMatch.id
      );
      if (expenditureCancel) {
        store.removeEvent(expenditureCancel, "pendingExpenditureCancels");
      }
    } else {
      await store.pushEvent(
        {
          type: expenditureType,
          eventTime: Date.now()
        },
        "expenditures"
      );
      api.submitEvents(
        EXPENDITURE_LOG_MUTATION,
        "expenditures",
        apiResponse => {
          const expenditures = apiResponse.data.logExpenditures.expenditures;
          return store.updateAllSubmittedEvents(
            expenditures.map(parseExpenditureFromBackend),
            "expenditures"
          );
        }
      );
    }
  };

  const cancelExpenditure = async expenditureToCancel => {
    if (expenditureToCancel.isBeingSubmitted) return;
    if (!expenditureToCancel.id) {
      store.removeEvent(expenditureToCancel, "expenditures");
    } else {
      await store.pushEvent(
        {
          eventId: expenditureToCancel.id,
          eventTime: Date.now()
        },
        "pendingExpenditureCancels"
      );
      api.submitEvents(
        EXPENDITURE_CANCEL_MUTATION,
        "pendingExpenditureCancels",
        apiResponse => {
          const expenditures = apiResponse.data.cancelExpenditures.expenditures;
          return Promise.all([
            store.updateAllSubmittedEvents(
              expenditures.map(parseExpenditureFromBackend),
              "expenditures"
            ),
            store.updateAllSubmittedEvents([], "pendingExpenditureCancels")
          ]);
        }
      );
    }
  };

  return (
    <ActionsContext.Provider
      value={{
        pushNewActivityEvent,
        pushNewTeamEnrollment,
        cancelOrReviseActivityEvent,
        pushNewMission,
        pushNewVehicleBooking,
        pushNewComment,
        pushNewExpenditure,
        cancelExpenditure
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export const useActions = () => React.useContext(ActionsContext);
