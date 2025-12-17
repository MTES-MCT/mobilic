import { v4 as uuidv4 } from "uuid";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useApi } from "common/utils/api";
import {
  useAdminStore,
  VIRTUAL_ACTIVITIES_ACTIONS,
  VIRTUAL_EXPENDITURES_ACTIONS
} from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { currentUserId } from "common/utils/cookie";
import { reduceVirtualActivities } from "../store/reducers/virtualActivities";
import {
  getPayloadCreateActivity,
  getPayloadFromVirtualActivities,
  getPayloadFromVirtualExpenditures,
  getPayloadUpdateActivity
} from "./virtualPayloads";
import { BULK_ACTIVITY_QUERY } from "common/utils/apiQueries/admin";
import {
  buildLogLocationPayloadFromAddress,
  CANCEL_COMMENT_MUTATION,
  CANCEL_MISSION_MUTATION,
  CHANGE_MISSION_NAME_MUTATION,
  LOG_COMMENT_MUTATION,
  LOG_LOCATION_MUTATION,
  REGISTER_KILOMETER_AT_LOCATION,
  UPDATE_MISSION_VEHICLE_MUTATION,
  VALIDATE_MISSION_MUTATION
} from "common/utils/apiQueries/missions";

const testBulkActivities = async (api, virtualActivities) => {
  if (virtualActivities.length > 0) {
    return await api.nonConcurrentQueryQueue.execute(() =>
      api.graphQlQuery(BULK_ACTIVITY_QUERY, {
        items: getPayloadFromVirtualActivities(virtualActivities)
      })
    );
  }
};

async function severalActionsActivity(api, mission, adminStore, modalArgs) {
  let tmpVirtualActivities = adminStore.virtualActivities;
  const toDispatch = [];

  for (const arg of modalArgs.actions) {
    if (arg.type === VIRTUAL_ACTIVITIES_ACTIONS.edit) {
      const { activity, actionType, newStartTime, newEndTime, userComment } =
        arg.payload;
      const { payload, shouldCancel } = getPayloadUpdateActivity(
        activity,
        actionType,
        newStartTime,
        newEndTime,
        userComment
      );
      tmpVirtualActivities = reduceVirtualActivities(tmpVirtualActivities, {
        action: shouldCancel
          ? VIRTUAL_ACTIVITIES_ACTIONS.cancel
          : VIRTUAL_ACTIVITIES_ACTIONS.edit,
        payload,
        activityId: activity.id
      });

      // check ok
      await testBulkActivities(api, tmpVirtualActivities);

      // update
      if (shouldCancel) {
        mission.activities = mission.activities.filter(
          (a) => a.id !== activity.id
        );
      } else {
        mission.activities = mission.activities.map((a) =>
          a.id === activity.id
            ? {
                ...a,
                startTime: newStartTime,
                endTime: newEndTime,
                lastSubmitterId: currentUserId()
              }
            : a
        );
      }
      toDispatch.push({
        type: ADMIN_ACTIONS.addVirtualActivity,
        payload: {
          virtualActivity: {
            action: shouldCancel
              ? VIRTUAL_ACTIVITIES_ACTIONS.cancel
              : VIRTUAL_ACTIVITIES_ACTIONS.edit,
            payload,
            activityId: activity.id
          }
        }
      });
    }
    if (arg.type === VIRTUAL_ACTIVITIES_ACTIONS.create) {
      const payload = getPayloadCreateActivity(arg.payload, mission);
      tmpVirtualActivities = reduceVirtualActivities(tmpVirtualActivities, {
        action: VIRTUAL_ACTIVITIES_ACTIONS.create,
        payload,
        activityId: uuidv4(),
        virtual: true
      });

      // check ok
      const apiResponse = await testBulkActivities(api, tmpVirtualActivities);

      // apply changes
      const activity = apiResponse.data.output;
      mission.activities = [
        ...mission.activities,
        { ...activity, user: modalArgs.user }
      ];
      toDispatch.push({
        type: ADMIN_ACTIONS.addVirtualActivity,
        payload: {
          virtualActivity: {
            action: VIRTUAL_ACTIVITIES_ACTIONS.create,
            payload,
            activityId: activity.id,
            virtual: true
          }
        }
      });
    }
  }

  toDispatch.forEach((payload) => adminStore.dispatch(payload));
}

async function createExpenditure(
  api,
  mission,
  adminStore,
  { type, spendingDate, userId = null }
) {
  const expenditure = {
    type,
    userId,
    missionId: mission.id,
    spendingDate: spendingDate
  };
  const newId = uuidv4();
  adminStore.dispatch({
    type: ADMIN_ACTIONS.addVirtualExpenditureAction,
    payload: {
      virtualExpenditureAction: {
        action: VIRTUAL_EXPENDITURES_ACTIONS.create,
        payload: expenditure,
        expenditureId: newId
      }
    }
  });
  mission.expenditures.push({
    ...expenditure,
    id: newId
  });
}

async function cancelExpenditure(api, mission, adminStore, { expenditure }) {
  adminStore.dispatch({
    type: ADMIN_ACTIONS.addVirtualExpenditureAction,
    payload: {
      virtualExpenditureAction: {
        action: VIRTUAL_EXPENDITURES_ACTIONS.cancel,
        payload: { expenditureId: expenditure.id }
      }
    }
  });
  mission.expenditures = mission.expenditures.filter(
    (e) => e.id !== expenditure.id
  );
}

async function createComment(api, mission, adminStore, text) {
  const apiResponse = await api.graphQlMutate(LOG_COMMENT_MUTATION, {
    text,
    missionId: mission.id
  });
  const comment = apiResponse.data.activities.logComment;
  mission.comments.push(comment);
}

async function validateMission(
  api,
  mission,
  adminStore,
  usersToValidate,
  overrideValidationJustification
) {
  const apiResponse = await api.graphQlMutate(VALIDATE_MISSION_MUTATION, {
    missionId: mission.id,
    usersIds: usersToValidate,
    ...(overrideValidationJustification
      ? { justification: overrideValidationJustification }
      : {}),
    activityItems: getPayloadFromVirtualActivities(
      adminStore.virtualActivities
    ),
    ...getPayloadFromVirtualExpenditures(adminStore.virtualExpenditureActions)
  });
  adminStore.dispatch({
    type: ADMIN_ACTIONS.resetVirtual
  });
  const missionResponse = apiResponse.data.activities.validateMission;
  mission.activities = [...missionResponse.activities];
  mission.expenditures = [...missionResponse.expenditures];
  mission.validations = [...missionResponse.validations];
}

async function cancelMission(api, mission, adminStore, args) {
  const user = args.user;
  const apiResponse = await api.graphQlMutate(CANCEL_MISSION_MUTATION, {
    missionId: mission.id,
    userId: user.id
  });
  adminStore.dispatch({
    type: ADMIN_ACTIONS.resetVirtual
  });
  mission.activities = [
    ...apiResponse.data.activities.cancelMission.activities
  ];
}

async function deleteComment(api, mission, adminStore, comment) {
  await api.graphQlMutate(CANCEL_COMMENT_MUTATION, {
    commentId: comment.id
  });
  mission.comments = mission.comments.filter((c) => c.id !== comment.id);
}

async function changeName(api, mission, adminStore, name) {
  await api.graphQlMutate(CHANGE_MISSION_NAME_MUTATION, {
    missionId: mission.id,
    name
  });
  mission.name = name;
}

async function updateVehicle(api, mission, adminStore, vehicle) {
  await api.graphQlMutate(UPDATE_MISSION_VEHICLE_MUTATION, {
    missionId: mission.id,
    vehicleId: vehicle.id,
    vehicleRegistrationNumber: vehicle.registrationNumber
  });
  mission.vehicle = vehicle;
}

async function updateLocation(
  api,
  mission,
  adminStore,
  address,
  isStart,
  kilometerReading
) {
  const payload = buildLogLocationPayloadFromAddress(
    address,
    mission.id,
    isStart,
    kilometerReading || null
  );

  const apiResponse = await api.graphQlMutate(LOG_LOCATION_MUTATION, {
    ...payload,
    overrideExisting: true
  });
  mission[isStart ? "startLocation" : "endLocation"] =
    apiResponse.data.activities.logLocation;
}

async function updateKilometerReading(
  api,
  mission,
  adminStore,
  kilometerReading,
  isStart
) {
  await api.graphQlMutate(REGISTER_KILOMETER_AT_LOCATION, {
    missionLocationId: mission[isStart ? "startLocation" : "endLocation"].id,
    kilometerReading
  });
  mission[isStart ? "startLocation" : "endLocation"] = {
    ...mission[isStart ? "startLocation" : "endLocation"],
    kilometerReading
  };
}

const missionActionWrapper =
  (
    alerts,
    api,
    mission,
    adminStore,
    setShouldRefreshActivityPanel,
    setMission
  ) =>
  (action, shouldRefreshActivityPanel = true) =>
  async (...args) => {
    await alerts.withApiErrorHandling(async () => {
      if (shouldRefreshActivityPanel && setShouldRefreshActivityPanel) {
        setShouldRefreshActivityPanel(true);
      }
      await action(api, mission, adminStore, ...args);
      if (setMission) {
        setMission({ ...mission });
      }
      adminStore.dispatch({
        type: ADMIN_ACTIONS.update,
        payload: { id: mission.id, entity: "missions", update: mission }
      });
      alerts.success(
        `La mission${
          mission.name ? " " + mission.name : ""
        } a été validée avec succès !`,
        mission.id,
        6000
      );
    });
  };

export function useMissionActions(
  mission,
  setMission,
  setShouldRefreshActivityPanel
) {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();

  const missionActionsDecorator = missionActionWrapper(
    alerts,
    api,
    mission,
    adminStore,
    setShouldRefreshActivityPanel,
    setMission
  );

  return {
    severalActionsActivity: missionActionsDecorator(severalActionsActivity),
    createExpenditure: missionActionsDecorator(createExpenditure),
    cancelExpenditure: missionActionsDecorator(cancelExpenditure),
    validateMission: missionActionsDecorator(validateMission),
    cancelMission: missionActionsDecorator(cancelMission),
    createComment: missionActionsDecorator(createComment, false),
    deleteComment: missionActionsDecorator(deleteComment, false),
    changeName: missionActionsDecorator(changeName),
    updateVehicle: missionActionsDecorator(updateVehicle, false),
    updateLocation: missionActionsDecorator(updateLocation, false),
    updateKilometerReading: missionActionsDecorator(
      updateKilometerReading,
      false
    )
  };
}
