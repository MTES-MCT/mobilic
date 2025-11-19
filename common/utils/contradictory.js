import maxBy from "lodash/maxBy";
import flatMap from "lodash/flatMap";
import { ADMIN_ACTIONS } from "../../web/admin/store/reducers/root";
import { useStoreSyncedWithLocalStorage } from "../store/store";
import { useAdminStore } from "../../web/admin/store/store";
import { ALL_MISSION_RESOURCES_WITH_HISTORY_QUERY } from "./apiQueries/admin";
import { CONTROLLER_READ_MISSION_DETAILS } from "./apiQueries/controller";

const DIFFERENT_RESOURCES_EVENT_TYPE_ORDER = {
  DELETE: 1,
  UPDATE: 2,
  CREATE: 3
};

const SAME_RESOURCES_EVENT_TYPE_ORDER = {
  CREATE: 1,
  UPDATE: 2,
  DELETE: 3
};

export const MISSION_RESOURCE_TYPES = {
  activity: "activity",
  expenditure: "expenditure",
  startLocation: "startLocation",
  endLocation: "endLocation",
  validation: "validation",
  autoValidationEmployee: "auto-validation-employee",
  autoValidationAdmin: "auto-validation-admin"
};

const RESOURCE_TYPE_ORDER = {
  [MISSION_RESOURCE_TYPES.startLocation]: 5,
  [MISSION_RESOURCE_TYPES.activity]: 4,
  [MISSION_RESOURCE_TYPES.endLocation]: 3,
  [MISSION_RESOURCE_TYPES.expenditure]: 2,
  [MISSION_RESOURCE_TYPES.validation]: 1,
  [MISSION_RESOURCE_TYPES.autoValidationEmployee]: 1,
  [MISSION_RESOURCE_TYPES.autoValidationAdmin]: 1
};

export function orderLogEvents(event1, event2) {
  const timeDiff = event1.time - event2.time;
  if (timeDiff !== 0) return timeDiff;
  if (event1.resourceType !== event2.resourceType)
    return (
      RESOURCE_TYPE_ORDER[event2.resourceType] -
      RESOURCE_TYPE_ORDER[event1.resourceType]
    );
  if (event1.resourceId && event1.resourceId === event2.resourceId)
    return (
      SAME_RESOURCES_EVENT_TYPE_ORDER[event2.type] -
      SAME_RESOURCES_EVENT_TYPE_ORDER[event1.type]
    );
  return (
    DIFFERENT_RESOURCES_EVENT_TYPE_ORDER[event2.type] -
    DIFFERENT_RESOURCES_EVENT_TYPE_ORDER[event1.type]
  );
}

function allEventsForResource(resource, resourceType) {
  const events = [];

  if (resource.versions) {
    resource.versions.sort((v1, v2) => v1.receptionTime - v2.receptionTime);
  }

  const userId = resource.user ? resource.user.id : resource.userId;

  if (resource.receptionTime) {
    events.push({
      resourceId: resource.id,
      time: resource.receptionTime,
      type: "CREATE",
      resourceType,
      before: null,
      after: resource.versions
        ? { ...resource, ...resource.versions[0] }
        : resource,
      submitter: resource.submitter,
      submitterId: resource.submitterId,
      userId
    });
  }

  if (resource.dismissedAt) {
    events.push({
      resourceId: resource.id,
      time: resource.dismissedAt,
      type: "DELETE",
      resourceType,
      before: resource,
      after: null,
      submitter: resource.dismissAuthor,
      submitterId: resource.dismissAuthor.id,
      userId
    });
  }

  if (resource.versions && resource.versions.length > 1) {
    resource.versions.slice(1).forEach((version, index) => {
      events.push({
        resourceId: resource.id,
        time: version.receptionTime,
        type: "UPDATE",
        resourceType,
        before: { ...resource, ...resource.versions[index] },
        after: { ...resource, ...version },
        submitter: version.submitter,
        submitterId: version.submitter.id,
        userId
      });
    });
  }

  return events;
}

function versionOfResourceAt(resource, time) {
  if (resource.receptionTime && resource.receptionTime > time) return null;
  if (resource.dismissedAt && resource.dismissedAt <= time) return null;
  if (
    resource.lastUpdateTime &&
    resource.lastUpdateTime > time &&
    resource.versions &&
    resource.versions.length > 0
  ) {
    const versionAtTime =
      maxBy(
        resource.versions.filter((v) => v.receptionTime <= time),
        (v) => v.receptionTime
      ) || {};
    return { ...resource, ...versionAtTime };
  }
  return resource;
}

function buildEventsHistory(resources) {
  const history = flatMap(resources, ({ resource, type }) =>
    allEventsForResource(resource, type)
  );
  history.sort(orderLogEvents);
  return history;
}

export function getVersionsOfResourcesAt(resources, time) {
  return resources
    .map(({ resource, type }) => ({
      resource: versionOfResourceAt(resource, time),
      type
    }))
    .filter(({ resource }) => Boolean(resource));
}

async function retrieveResourcesAsUser(api, missionId) {
  return (
    await api.graphQlMutate(ALL_MISSION_RESOURCES_WITH_HISTORY_QUERY, {
      missionId
    })
  ).data.mission;
}

async function retrieveResourcesAsController(api, missionId, controlId) {
  const apiResponse = await api.graphQlMutate(
    CONTROLLER_READ_MISSION_DETAILS,
    {
      missionId,
      controlId
    },
    { context: { nonPublicApi: true } }
  );
  return apiResponse.data.controlData.missions[0];
}

export async function getResourcesAndHistoryForMission(
  mission,
  api,
  cacheInStore,
  controlId = null
) {
  if (!mission.resourcesWithHistory) {
    const apiResponse = !controlId
      ? await retrieveResourcesAsUser(api, mission.id)
      : await retrieveResourcesAsController(api, mission.id, controlId);

    let resources = [];
    resources.push(
      ...apiResponse.activities.map((a) => ({
        resource: a,
        type: MISSION_RESOURCE_TYPES.activity
      }))
    );
    resources.push(
      ...apiResponse.expenditures.map((e) => ({
        resource: e,
        type: MISSION_RESOURCE_TYPES.expenditure
      }))
    );
    resources.push(
      ...apiResponse.validations
        .filter((v) => !v.isAuto)
        .map((v) => ({
          resource: v,
          type: MISSION_RESOURCE_TYPES.validation
        }))
    );
    resources.push(
      ...apiResponse.validations
        .filter((v) => v.isAuto && !v.isAdmin)
        .map((v) => ({
          resource: v,
          type: MISSION_RESOURCE_TYPES.autoValidationEmployee
        }))
    );
    resources.push(
      ...apiResponse.validations
        .filter((v) => v.isAuto && v.isAdmin)
        .map((v) => ({
          resource: v,
          type: MISSION_RESOURCE_TYPES.autoValidationAdmin
        }))
    );
    resources.push({
      resource: apiResponse.startLocation,
      type: MISSION_RESOURCE_TYPES.startLocation
    });
    resources.push({
      resource: apiResponse.endLocation,
      type: MISSION_RESOURCE_TYPES.endLocation
    });

    resources = resources.filter(({ resource }) => Boolean(resource));
    const history = buildEventsHistory(resources);

    const resourcesWithHistory = { resources, history };

    cacheInStore(mission, resourcesWithHistory);
    mission.resourcesWithHistory = resourcesWithHistory;
  }
  return mission.resourcesWithHistory;
}

function cacheInPwaStore(mission, resourcesWithHistory, store) {
  store.updateEntityObject({
    objectId: mission.id,
    entity: "missions",
    update: { resourcesWithHistory }
  });
  store.batchUpdate();
}

function cacheInAdminStore(mission, resourcesWithHistory, adminStore) {
  adminStore.dispatch({
    type: ADMIN_ACTIONS.update,
    payload: {
      id: mission.id,
      entity: "missions",
      update: { resourcesWithHistory }
    }
  });
}

export function useCacheContradictoryInfoInPwaStore() {
  const store = useStoreSyncedWithLocalStorage();

  return (mission, resourcesWithHistory) =>
    cacheInPwaStore(mission, resourcesWithHistory, store);
}

export function useCacheContradictoryInfoInAdminStore() {
  const adminStore = useAdminStore();

  return (mission, resourcesWithHistory) =>
    cacheInAdminStore(mission, resourcesWithHistory, adminStore);
}
