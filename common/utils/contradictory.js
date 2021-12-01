import maxBy from "lodash/maxBy";
import flatMap from "lodash/flatMap";
import { ALL_MISSION_RESOURCES_WITH_HISTORY_QUERY } from "./apiQueries";
import { NonConcurrentExecutionQueue } from "./concurrency";
import { ADMIN_ACTIONS } from "../../web/admin/store/reducers/root";
import { useStoreSyncedWithLocalStorage } from "../store/store";
import { useAdminStore } from "../../web/admin/store/store";

export const MISSION_RESOURCE_TYPES = {
  activity: "activity",
  expenditure: "expenditure",
  startLocation: "startLocation",
  endLocation: "endLocation",
  validation: "validation"
};

function allEventsForResource(resource, resourceType) {
  const events = [];

  if (resource.versions) {
    resource.versions.sort((v1, v2) => v1.receptionTime - v2.receptionTime);
  }

  const userId = resource.user ? resource.user.id : resource.userId;

  if (resource.receptionTime) {
    events.push({
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
        resource.versions.filter(v => v.receptionTime <= time),
        v => v.receptionTime
      ) || {};
    return { ...resource, ...versionAtTime };
  }
  return resource;
}

function buildEventsHistory(resources) {
  const history = flatMap(resources, ({ resource, type }) =>
    allEventsForResource(resource, type)
  );
  history.sort((c1, c2) => c2.time - c1.time);
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

const missionResourcesWithHistoryFetchQueue = new NonConcurrentExecutionQueue();

export async function getResourcesAndHistoryForMission(
  mission,
  api,
  cacheInStore
) {
  if (!mission.resourcesWithHistory) {
    await missionResourcesWithHistoryFetchQueue.execute(
      async () => {
        const apiResponse = (
          await api.graphQlMutate(ALL_MISSION_RESOURCES_WITH_HISTORY_QUERY, {
            missionId: mission.id
          })
        ).data.mission;

        let resources = [];
        resources.push(
          ...apiResponse.activities.map(a => ({
            resource: a,
            type: MISSION_RESOURCE_TYPES.activity
          }))
        );
        resources.push(
          ...apiResponse.expenditures.map(e => ({
            resource: e,
            type: MISSION_RESOURCE_TYPES.expenditure
          }))
        );
        resources.push(
          ...apiResponse.validations.map(v => ({
            resource: v,
            type: MISSION_RESOURCE_TYPES.validation
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
      },
      { cacheKey: mission.id, queueName: mission.id }
    );
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
