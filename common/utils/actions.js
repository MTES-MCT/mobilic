import React from "react";
import mapValues from "lodash/mapValues";
import map from "lodash/map";
import keyBy from "lodash/keyBy";
import { isPendingSubmission, useStoreSyncedWithLocalStorage } from "./store";
import {
  BEGIN_MISSION_MUTATION,
  BOOK_VEHICLE_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  EDIT_MISSION_EXPENDITURES_MUTATION,
  END_MISSION_MUTATION,
  ENROLL_OR_RELEASE_TEAM_MATE_MUTATION,
  LOG_ACTIVITY_MUTATION,
  LOG_COMMENT_MUTATION,
  useApi,
  VALIDATE_MISSION_MUTATION
} from "./api";
import { ACTIVITIES, parseActivityPayloadFromBackend } from "./activities";
import { parseMissionPayloadFromBackend } from "./mission";

const ActionsContext = React.createContext(() => {});

export function ActionsContextProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();

  async function submitAction(
    query,
    variables,
    optimisticStoreUpdate,
    watchFields,
    handleSubmitResponse,
    batchable = true,
    onApiError = () => {}
  ) {
    // 1. Store the request and optimistically update the store as if the api responded successfully
    await store.newRequest(
      query,
      variables,
      optimisticStoreUpdate,
      watchFields,
      handleSubmitResponse,
      batchable,
      onApiError
    );

    // 2. Execute the request (call API) along with any other pending one
    // await api.nonConcurrentQueryQueue.execute(() => api.executeRequest(request));
    await api.executePendingRequests();
  }

  const pushNewActivityEvent = async ({
    activityType,
    missionId,
    driver = null,
    userTime = null,
    userComment = null
  }) => {
    const newActivity = {
      type: activityType,
      eventTime: Date.now(),
      missionId
    };
    if (driver)
      newActivity.driver = {
        id: parseInt(driver.id) || null,
        firstName: driver.firstName,
        lastName: driver.lastName
      };
    if (userTime) newActivity.userTime = userTime;
    if (userComment !== undefined && userComment !== null)
      newActivity.comment = userComment;

    const updateStore = (store, requestId) =>
      store.createEntityObject(
        { ...newActivity, driver },
        "activities",
        requestId
      );

    await submitAction(
      LOG_ACTIVITY_MUTATION,
      newActivity,
      updateStore,
      ["activities"],
      apiResponse => {
        const activities = apiResponse.data.logActivity.missionActivities.map(
          parseActivityPayloadFromBackend
        );
        store.syncEntity(
          activities,
          "activities",
          a => a.missionId === activities[0].missionId
        );
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
      if (activityEvent.pendingUpdate.type === "update") {
        await store.clearPendingRequest(
          store
            .pendingRequests()
            .find(r => r.id === activityEvent.pendingUpdate.requestId)
        );
      }
      // If the event is not present in the db yet we can more or less do the same
      else if (activityEvent.pendingUpdate.type === "create") {
        shouldCallApi = false;
        const requestToAlter = store
          .pendingRequests()
          .find(r => r.id === activityEvent.pendingUpdate.requestId);
        if (requestToAlter.query !== BEGIN_MISSION_MUTATION) {
          await store.clearPendingRequest(requestToAlter);
          if (activityEvent === "revision") {
            return pushNewActivityEvent({
              activityType: activityEvent.type,
              missionId: activityEvent.missionId,
              driver: activityEvent.driver,
              userTime: newUserTime,
              userComment
            });
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
        comment: userComment
      };

      const updateStore = (store, requestId) => {
        if (actionType === "cancel") {
          store.deleteEntityObject(activityEvent.id, "activities", requestId);
        } else {
          store.updateEntityObject(
            activityEvent.id,
            "activities",
            { userTime: newUserTime },
            requestId
          );
        }
      };

      await submitAction(
        EDIT_ACTIVITY_MUTATION,
        editActivityPayload,
        updateStore,
        ["activities"],
        apiResponse => {
          const activities = apiResponse.data.editActivity.missionActivities.map(
            parseActivityPayloadFromBackend
          );
          store.syncEntity(
            activities,
            "activities",
            a => a.missionId === activities[0].missionId
          );
        }
      );
    }
  };

  const _updateStoreWithCoworkerEnrollment = (
    store,
    requestId,
    id,
    firstName,
    lastName,
    missionId,
    isEnrollment,
    eventTime
  ) => {
    let coworker;
    if (id) coworker = store.getEntity("coworkers")[id];
    if (!coworker) {
      coworker = {
        id,
        firstName,
        lastName
      };
    }
    store.createEntityObject(
      {
        eventTime,
        coworker,
        missionId,
        isEnrollment
      },
      "teamChanges",
      requestId
    );
  };

  const pushNewTeamEnrollmentOrRelease = async (
    id,
    firstName,
    lastName,
    isEnrollment,
    missionId
  ) => {
    const eventTime = Date.now();
    const enrollmentOrReleasePayload = {
      eventTime,
      teamMate: {
        id: parseInt(id) || null,
        firstName,
        lastName
      },
      missionId,
      isEnrollment
    };
    const updateStore = (store, requestId) => {
      _updateStoreWithCoworkerEnrollment(
        store,
        requestId,
        id,
        firstName,
        lastName,
        missionId,
        isEnrollment,
        eventTime
      );
    };

    await submitAction(
      ENROLL_OR_RELEASE_TEAM_MATE_MUTATION,
      enrollmentOrReleasePayload,
      updateStore,
      ["coworkers"],
      apiResponse => {
        const teamChange = apiResponse.data.enrollOrReleaseTeamMate.teamChange;
        store.syncEntity([teamChange], "teamChanges", () => false);
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
      firstActivityType
    };

    if (team) missionPayload.team = team;
    if (vehicleId) missionPayload.vehicleId = vehicleId;
    if (vehicleRegistrationNumber)
      missionPayload.vehicleRegistrationNumber = vehicleRegistrationNumber;
    if (driver)
      missionPayload.driver = {
        id: parseInt(driver.id) || null,
        firstName: driver.firstName,
        lastName: driver.lastName
      };

    const updateStore = async (store, requestId) => {
      const mission = {
        name,
        eventTime: missionPayload.eventTime,
        expenditures: {}
      };
      const missionId = await store.createEntityObject(
        mission,
        "missions",
        requestId
      );
      store.createEntityObject(
        {
          type: firstActivityType,
          missionId,
          eventTime: mission.eventTime,
          driver: driver
        },
        "activities",
        requestId
      );
      if (vehicleId || vehicleRegistrationNumber)
        store.createEntityObject(
          {
            eventTime: mission.eventTime,
            missionId,
            vehicleId: vehicleId,
            vehicleName: vehicleRegistrationNumber
          },
          "vehicleBookings",
          requestId
        );
      if (team)
        team.forEach(tm =>
          _updateStoreWithCoworkerEnrollment(
            store,
            requestId,
            tm.id,
            tm.firstName,
            tm.lastName,
            missionId,
            true,
            mission.eventTime
          )
        );

      return { missionId };
    };

    await submitAction(
      BEGIN_MISSION_MUTATION,
      missionPayload,
      updateStore,
      ["missions", "activities", "vehicleBookings"],
      async (apiResponse, { missionId: tempMissionId }) => {
        const mission = apiResponse.data.beginMission.mission;
        await new Promise((resolve, reject) => {
          store.setStoreState(
            prevState => ({
              pendingRequests: prevState.pendingRequests.map(request => {
                const requestVariables = { ...request.variables };
                if (requestVariables.missionId === tempMissionId) {
                  requestVariables.missionId = mission.id;
                }
                return { ...request, variables: requestVariables };
              })
            }),
            ["pendingRequests"],
            resolve
          );
        });
        store.syncEntity(
          [parseMissionPayloadFromBackend(mission)],
          "missions",
          () => false
        );
        store.setStoreState(
          prevState => ({
            activities: {
              ...mapValues(prevState.activities, a => ({
                ...a,
                missionId:
                  a.missionId === tempMissionId ? mission.id : a.missionId
              })),
              ...keyBy(
                mission.activities.map(parseActivityPayloadFromBackend),
                a => a.id.toString()
              )
            }
          }),
          ["activities"]
        );
        store.setStoreState(
          prevState => ({
            teamChanges: [
              ...map(prevState.teamChanges, a => ({
                ...a,
                missionId:
                  a.missionId === tempMissionId ? mission.id : a.missionId
              })),
              ...mission.teamChanges
            ]
          }),
          ["teamChanges"]
        );
        store.setStoreState(
          prevState => ({
            comments: {
              ...mapValues(prevState.comments, a => ({
                ...a,
                missionId:
                  a.missionId === tempMissionId ? mission.id : a.missionId
              })),
              ...keyBy(mission.comments, a => a.id.toString())
            }
          }),
          ["comments"]
        );
        _handleNewVehicleBookingsFromApi(mission.vehicleBookings);
        store.setStoreState(
          prevState => ({
            vehicleBookings: mapValues(prevState.vehicleBookings, a => ({
              ...a,
              missionId:
                a.missionId === tempMissionId ? mission.id : a.missionId
            }))
          }),
          ["vehicleBookings"]
        );
      },
      false,
      async (error, { missionId: tempMissionId }) => {
        // If the begin-mission event raises an API error we cancel all the pending requests for the mission
        const pendingMissionRequests = store
          .pendingRequests()
          .filter(req => req.variables.missionId === tempMissionId);
        await Promise.all(
          pendingMissionRequests.map(req => store.clearPendingRequest(req))
        );
        store.syncEntity([], "missions", m => m.id === tempMissionId);
      }
    );
  };

  const endMission = async ({
    endTime,
    missionId,
    expenditures = null,
    comment = null
  }) => {
    const endMissionPayload = {
      eventTime: endTime,
      missionId
    };
    if (expenditures) endMissionPayload.expenditures = expenditures;
    if (comment) endMissionPayload.comment = comment;

    const updateStore = (store, requestId) => {
      store.createEntityObject(
        {
          type: ACTIVITIES.rest.name,
          eventTime: endMissionPayload.eventTime,
          missionId
        },
        "activities",
        requestId
      );
      store.updateEntityObject(
        missionId,
        "missions",
        { expenditures },
        requestId
      );
    };

    await submitAction(
      END_MISSION_MUTATION,
      endMissionPayload,
      updateStore,
      ["activities", "missions"],
      apiResponse => {
        const mission = apiResponse.data.endMission.mission;
        store.syncEntity(
          mission.activities.map(parseActivityPayloadFromBackend),
          "activities",
          a => a.missionId === mission.id
        );
        store.syncEntity(
          [parseMissionPayloadFromBackend(mission)],
          "missions",
          m => m.id === mission.id
        );
      }
    );
  };

  const validateMission = async mission => {
    let update = { validated: true };
    if (isPendingSubmission(mission)) {
      if (api.isCurrentlySubmittingRequests()) return;
      if (mission.pendingUpdate.type === "update") {
        update = { ...mission.pendingUpdate.new, ...update };
      }
    }
    const updateStore = (store, requestId) => {
      store.updateEntityObject(mission.id, "missions", update, requestId);
    };

    await submitAction(
      VALIDATE_MISSION_MUTATION,
      { missionId: mission.id },
      updateStore,
      ["missions"],
      async apiResponse => {
        const mission = apiResponse.data.validateMission.mission;
        await store.syncEntity(
          [parseMissionPayloadFromBackend(mission)],
          "missions",
          m => m.id === mission.id
        );
      }
    );
  };

  const _handleNewVehicleBookingsFromApi = newVehicleBookings => {
    store.syncEntity(newVehicleBookings, "vehicleBookings", () => false);
    newVehicleBookings.forEach(vehicleBooking => {
      const vehicle = store.getEntity("vehicles")[
        vehicleBooking.vehicle.id.toString()
      ];
      if (!vehicle)
        store.syncEntity(vehicleBooking.vehicle, "vehicles", () => false);
    });
  };

  const pushNewVehicleBooking = async (vehicle, userTime, missionId) => {
    if (!vehicle) return;
    const { id, registrationNumber } = vehicle;
    const vehicleBookingPayload = {
      eventTime: Date.now(),
      missionId
    };
    if (id) vehicleBookingPayload.vehicleId = id;
    if (registrationNumber)
      vehicleBookingPayload.registrationNumber = registrationNumber;

    if (userTime) vehicleBookingPayload.userTime = userTime;

    let actualVehicle;
    if (id) actualVehicle = store.getEntity("vehicles")[id.toString()];

    const updateStore = (store, requestId) => {
      store.createEntityObject(
        {
          ...vehicleBookingPayload,
          vehicleName: actualVehicle ? actualVehicle.name : registrationNumber
        },
        "vehicleBookings",
        requestId
      );
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

  const pushNewComment = async (content, missionId) => {
    const commentPayload = {
      eventTime: Date.now(),
      content,
      missionId
    };

    const updateStore = (store, requestId) => {
      store.createEntityObject({ ...commentPayload }, "comments", requestId);
    };

    await submitAction(
      LOG_COMMENT_MUTATION,
      commentPayload,
      updateStore,
      ["comments"],
      apiResponse => {
        const comment = apiResponse.data.logComment.comment;
        store.syncEntity([comment], "comments", () => false);
      }
    );
  };

  const editMissionExpenditures = async (mission, newExpenditures) => {
    if (isPendingSubmission(mission)) {
      if (api.isCurrentlySubmittingRequests()) return;
      await api.nonConcurrentQueryQueue.execute(async () => {
        const previousRequestId = mission.pendingUpdate.requestId;
        const previousRequest = store
          .pendingRequests()
          .find(req => req.id === previousRequestId);
        previousRequest.variables = {
          ...previousRequest.variables,
          expenditures: newExpenditures
        };
        await store.updateItemInArray(previousRequest, "pendingRequests");
        await store.updateEntityObject(
          mission.id,
          "missions",
          { expenditures: newExpenditures },
          previousRequestId
        );
      });
    } else {
      const editExpenditurePayload = {
        missionId: mission.id,
        expenditures: newExpenditures
      };

      const updateStore = (store, requestId) =>
        store.updateEntityObject(
          mission.id,
          "missions",
          { expenditures: newExpenditures },
          requestId
        );

      await submitAction(
        EDIT_MISSION_EXPENDITURES_MUTATION,
        editExpenditurePayload,
        updateStore,
        ["missions"],
        async apiResponse => {
          const mission = apiResponse.data.editMissionExpenditures.mission;
          await store.syncEntity(
            [parseMissionPayloadFromBackend(mission)],
            "missions",
            m => m.id === mission.id
          );
        }
      );
    }
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
        validateMission,
        editMissionExpenditures
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
}

export const useActions = () => React.useContext(ActionsContext);
