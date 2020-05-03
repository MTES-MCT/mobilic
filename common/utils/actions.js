import React from "react";
import {isPendingSubmission, useStoreSyncedWithLocalStorage} from "./store";
import {BEGIN_MISSION_MUTATION, BOOK_VEHICLE_MUTATION,
  EDIT_ACTIVITY_MUTATION, END_MISSION_MUTATION, ENROLL_OR_RELEASE_TEAM_MATE_MUTATION,
  LOG_ACTIVITY_MUTATION, LOG_COMMENT_MUTATION,
  useApi,
} from "./api";
import {ACTIVITIES, parseActivityPayloadFromBackend} from "./activities";

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
    missionId = null,
    driver = null,
    userTime = null,
    userComment = null
  }) => {
    const newActivity = {
      type: activityType,
      eventTime: Date.now()
    };
    if (driver)
      newActivity.driver = {id: driver.id, firstName: driver.firstName, lastName: driver.lastName};
    if (missionId)
      newActivity.missionId = missionId;
    if (userTime)
      newActivity.userTime = userTime;
    if (userComment !== undefined && userComment !== null)
      newActivity.comment = userComment;

    const updateStore = (store, requestId) => store.pushItem(
      {...newActivity, createdByRequestId: requestId},
      "activities"
    );

    await submitAction(
      LOG_ACTIVITY_MUTATION,
      newActivity,
      updateStore,
      ["activities"],
      apiResponse => {
        const activities = apiResponse.data.logActivity.missionActivities.map(parseActivityPayloadFromBackend);
        store.syncAllSubmittedItems(activities, "activities", (a) => a.missionId === activities[0].missionId)
      }
    );
  };

  const editActivityEvent = async (
    activityEvent,
    actionType,
    newUserTime = null,
    userComment = null
  ) => {
    let shouldCallApi = true;
    if (isPendingSubmission(activityEvent)) {
      if (api.isCurrentlySubmittingRequests()) return;
      // If the event is present in the db and has other unsubmitted updates we edit these updates
      if (activityEvent.updatedByRequestId) {
        await store.clearPendingRequest(store.getItemById(activityEvent.updatedByRequestId, "pendingRequests"));
      }
      // If the event is not present in the db yet we can more or less do the same
      else if (activityEvent.createdByRequestId) {
        shouldCallApi = false;
        const requestToAlter = store.getItemById(activityEvent.updatedByRequestId);
        if (requestToAlter.query !== MISSION_LOG_MUTATION) {
          await store.clearPendingRequest(requestToAlter);
          if (activityEvent === "revision") {
            return pushNewActivityEvent(
              requestToAlter.variables.type,
              requestToAlter.variables.driverId,
              newUserTime,
              userComment
            )
          }
        }
      }
    }
    if (shouldCallApi) {
      const editActivityPayload = {
        eventTime: Date.now(),
        activityId: activityEvent.id,
        dismiss: actionType === "cancel",
        userTime: newUserTime,
        comment: userComment,
      };

      const updateStore = (store, requestId) => {
        const updatedActivity = actionType === "cancel"
          ? {...activityEvent, deletedByRequestId: requestId}
          : {...activityEvent, updatedByRequestId: requestId, userTime: newUserTime};
        store.pushItem(updatedActivity, "activities");
      };

      await submitAction(
        EDIT_ACTIVITY_MUTATION,
        editActivityPayload,
        updateStore,
        ["activities"],
        apiResponse => {
          const activities = apiResponse.data.editActivity.missionActivities.map(parseActivityPayloadFromBackend);
          store.syncAllSubmittedItems(activities, "activities", (a) => a.missionId === activities[0].missionId)
        }
      );
    }
  };

  const _updateStoreWithCoworkerEnrollment = (store, requestId, id, firstName, lastName, isEnrollment, enrollmentOrReleaseTime) => {
    let coworker;
    if (id) coworker = store.getItemById(id, "coworkers");
    if (!coworker) {
      coworker = {
        id,
        firstName,
        lastName,
      };
    }
    if (isEnrollment) coworker.joinedCurrentMissionAt = enrollmentOrReleaseTime;
    else coworker.leftCurrentMissionAt = enrollmentOrReleaseTime;
    store.setStoreState(prevState => ({
      coworkers: [
        ...prevState.coworkers.filter(cw => cw.id !== coworker.id || cw.firstName !== coworker.firstName || cw.lastName !== coworker.lastName),
        coworker
      ]
    }), ["coworkers"]);
  };

  const pushNewTeamEnrollmentOrRelease = async (
    id,
    firstName,
    lastName,
    isEnrollment
  ) => {
    const enrollmentOrReleaseTime = Date.now();
    const enrollmentOrReleasePayload = {
      eventTime: enrollmentOrReleaseTime,
      teamMate: {
        id,
        firstName,
        lastName
      },
      isEnrollment
    };
    const updateStore = (store, requestId) => {
      _updateStoreWithCoworkerEnrollment(store, requestId, id, firstName, lastName, isEnrollment, enrollmentOrReleaseTime);
    };

    await submitAction(
      ENROLL_OR_RELEASE_TEAM_MATE_MUTATION,
      enrollmentOrReleasePayload,
      updateStore,
      ["coworkers"],
      apiResponse => {
        const coworker = apiResponse.data.enrollOrReleaseTeamMate.coworker;
        store.setStoreState(prevState => ({
          coworkers: [
            ...prevState.coworkers.filter(cw => cw.id !== coworker.id || cw.firstName !== coworker.firstName || cw.lastName !== coworker.lastName),
            coworker
          ]
        }), ["coworkers"]);
      }
    );
  };

  const beginNewMission = async ({
   name,
   firstActivityType,
   team = null,
   vehicleRegistrationNumber = null,
   vehicleId = null,
   driver = null
  }) => {
    const missionPayload = {
      eventTime: Date.now(),
      name,
      firstActivityType,
    };

    if (team) missionPayload.team = team;
    if (vehicleId) missionPayload.vehicleId = vehicleId;
    if (vehicleRegistrationNumber) missionPayload.vehicleRegistrationNumber = vehicleRegistrationNumber;
    if (driver)
      missionPayload.driver = {id: driver.id, firstName: driver.firstName, lastName: driver.lastName};

    const updateStore = (store, requestId) => {
      const mission = {name, eventTime: missionPayload.eventTime, createdByRequestId: requestId};
      store.pushItem(mission, "missions");
      store.pushItem({type: firstActivityType, eventTime: mission.eventTime, driver: driver, createdByRequestId: requestId}, "activities");
      store.pushItem({eventTime: mission.eventTime, createdByRequestId: requestId, vehicleId: vehicleId, vehicleName: vehicleRegistrationNumber}, "vehicleBookings");
      store.setStoreState(prevState => ({
        coworkers: prevState.coworkers.map(cw => ({...cw, joinedCurrentMissionAt: null, leftCurrentMissionAt: null}))
      }), ["coworkers"]);
      if (team) team.forEach(tm => _updateStoreWithCoworkerEnrollment(store, requestId, tm.id, tm.firstName, tm.lastName, true, mission.eventTime));
    };
    
    await submitAction(
      BEGIN_MISSION_MUTATION,
      missionPayload,
      updateStore,
      ["missions", "activities", "vehicleBookings"],
      apiResponse => {
        const mission = apiResponse.data.beginMission.mission;;
        store.pushItem({id: mission.id, name: mission.name, eventTime: mission.eventTime}, "missions");
        store.setStoreState(prevState => ({
          activities: [
            ...prevState.activities.map(a => ({...a, missionId: a.missionId || mission.id})),
            ...mission.activities.map(parseActivityPayloadFromBackend)
          ]
        }), ["activities"]);
        store.setStoreState(prevState => ({
          comments: prevState.comments.map(a => ({...a, missionId: a.missionId || mission.id}))
        }), ["comments"]);
        _handleNewVehicleBookingsFromApi(mission.vehicleBookings);
        store.setStoreState(prevState => ({
          vehicleBookings: prevState.vehicleBookings.map(a => ({...a, missionId: a.missionId || mission.id}))
        }), ["vehicleBookings"]);
      }
    );
  };

  const endMission = async (
    missionId = null,
    expenditures = null
  ) => {
    const endMissionPayload = {
      eventTime: Date.now()
    };
    if (missionId) endMissionPayload.missionId = missionId;
    if (expenditures) endMissionPayload.expenditures = expenditures;

    const updateStore = (store, requestId) => {
      store.pushItem({type: ACTIVITIES.rest.name, eventTime: endMissionPayload.eventTime, missionId: missionId, createdByRequestId: requestId}, "activities");
      store.setStoreState(prevState => ({
        missions: prevState.missions.map(m => ({...m, expenditures: m.id === missionId ? expenditures : m.expenditures, updatedByRequestId: requestId}))
      }), ["missions"]);
    };

    await submitAction(
      END_MISSION_MUTATION,
      endMissionPayload,
      updateStore,
      ["activities", "missions"],
      apiResponse => {
        const mission = apiResponse.data.endMission.mission;
        store.syncAllSubmittedItems(mission.activities.map(parseActivityPayloadFromBackend), "activities", (a) => a.missionId === mission.id);
        store.setStoreState(prevState => ({
          missions: [
            ...prevState.missions.filter(m => m.id !== mission.id && m.id !== missionId),
            mission
          ],
        }), ["missions"]);
      }
    )
  }

  const _handleNewVehicleBookingsFromApi = (newVehicleBookings) => {
    store.setItems(prevState => ({
      vehicleBookings: [
        ...prevState.vehicleBookings,
        ...newVehicleBookings
      ]
    }));
    newVehicleBookings.forEach(vehicleBooking => {
      const vehicle = store.getItemById(vehicleBooking.vehicle.id, "vehicles");
      if (!vehicle) store.pushItem(vehicleBooking.vehicle, "vehicles");
    });
  };

  const pushNewVehicleBooking = async (vehicle, userTime, missionId = null) => {
    if (!vehicle) return;
    const { id, registrationNumber } = vehicle;
    const vehicleBookingPayload = {
      eventTime: Date.now()
    };
    if (id) vehicleBookingPayload.vehicleId = id;
    if (registrationNumber)
      vehicleBookingPayload.registrationNumber = registrationNumber;

    if (userTime) vehicleBookingPayload.userTime = userTime;
    if (missionId) vehicleBookingPayload.missionId = missionId;

    let actualVehicle;
    if (id) actualVehicle = store.getItemById(id, "vehicles");

    const updateStore = (store, requestId) => {
      store.pushItem({...vehicleBookingPayload, vehicleName: actualVehicle ? actualVehicle.name : registrationNumber, createdByRequestId: requestId}, "vehicleBookings");
    };

    await submitAction(
      BOOK_VEHICLE_MUTATION,
      vehicleBookingPayload,
      updateStore,
      ["vehicleBookings"],
      apiResponse => {
        const vehicleBooking = apiResponse.data.bookVehicle.vehicleBooking;
        _handleNewVehicleBookingsFromApi([vehicleBooking]);
      }
    );
  };

  const pushNewComment = async (content, missionId = null) => {
    const commentPayload = {
      eventTime: Date.now(),
      content
    };
    if (missionId) commentPayload.missionId = missionId;

    const updateStore = (store, requestId) => {
      store.pushItem({...commentPayload, createdByRequestId: requestId}, "comments");
    };

    await submitAction(
      LOG_COMMENT_MUTATION,
      commentPayload,
      updateStore,
      ["comments"],
      apiResponse => {
        const comment = apiResponse.data.logComment.comment;
        store.pushItem(comment, "comments");
      }
    );
  };

  return (
    <ActionsContext.Provider
      value={{
        pushNewActivityEvent,
        editActivityEvent,
        beginNewMission,
        pushNewTeamEnrollmentOrRelease,
        endMission,
        pushNewVehicleBooking,
        pushNewComment,
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export const useActions = () => React.useContext(ActionsContext);
