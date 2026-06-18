import React from "react";
import { now } from "common/utils/time";
import { useApi } from "common/utils/api";
import {
  getResourcesAndHistoryForMission,
  MISSION_RESOURCE_TYPES
} from "common/utils/contradictory";

function isRetroactiveCreate(event) {
  return (
    event.type === "CREATE" &&
    event.after &&
    event.after.endTime &&
    (event.submitterId !== event.userId || event.after.endTime)
  );
}

// Exclude normal end/resume of activity, only keep actual time shifts
function isTimeShift(event) {
  if (event.type !== "UPDATE") return false;
  const startChanged = event.after.startTime !== event.before.startTime;
  const endShifted =
    event.after.endTime !== event.before.endTime &&
    event.before.endTime &&
    event.after.endTime;
  return startChanged || endShifted;
}

export function getEventTagType(events) {
  if (events.some(e => e.type === "DELETE")) return "SUPPRESSION";
  if (events.some(e => (e.__virtual && e.type !== "CREATE") || isTimeShift(e)))
    return "MODIFICATION";
  if (
    events.some(
      e => isRetroactiveCreate(e) || (e.__virtual && e.type === "CREATE")
    )
  )
    return "AJOUT";
  return null;
}

export { isRetroactiveCreate };

export function useActivityHistory({
  activities,
  mission,
  cacheContradictoryInfoInStore,
  simplified
}) {
  const api = useApi();
  const [historyByActivityId, setHistoryByActivityId] = React.useState({});
  const [allActivityEvents, setAllActivityEvents] = React.useState([]);
  const [dismissedActivities, setDismissedActivities] = React.useState([]);
  const [expandedActivities, setExpandedActivities] = React.useState({});

  // cache invalidation on activities change
  const [historyVersion, setHistoryVersion] = React.useState(0);
  const activitiesRef = React.useRef(activities);

  if (activitiesRef.current !== activities) {
    activitiesRef.current = activities;
    if (mission?.resourcesWithHistory) {
      delete mission.resourcesWithHistory;
      setHistoryVersion(v => v + 1);
    }
  }

  // fetch persisted history
  React.useEffect(() => {
    if (!mission || !cacheContradictoryInfoInStore) return;

    async function loadHistory() {
      try {
        const { history, resources } = await getResourcesAndHistoryForMission(
          mission,
          api,
          cacheContradictoryInfoInStore
        );
        const activityEvents = history.filter(
          e => e.resourceType === MISSION_RESOURCE_TYPES.activity
        );
        const dismissed = resources
          .filter(
            r =>
              r.type === MISSION_RESOURCE_TYPES.activity && r.resource.dismissedAt
          )
          .map(r => r.resource);
        setDismissedActivities(dismissed);
        const grouped = {};
        activityEvents
          .filter(e => isTimeShift(e) || e.type === "DELETE" || isRetroactiveCreate(e))
          .forEach(event => {
            const id = event.resourceId;
            if (!grouped[id]) grouped[id] = [];
            grouped[id].push(event);
          });
        setHistoryByActivityId(grouped);
        setAllActivityEvents(activityEvents);
      } catch {
        // progressive enhancement, don't block rendering
      }
    }
    loadHistory();
  }, [mission, cacheContradictoryInfoInStore, historyVersion]);

  // build virtual events from __virtualAction tags set by missionActions.js "create" or "edit"
  const virtualEventsByActivityId = React.useMemo(() => {
    const grouped = {};
    const timestamp = now();
    activities.forEach(a => {
      if (!a.__virtualAction) return;
      const id = a.id;
      if (a.__virtualAction === "edit" && a.__virtualEdits) {
        if (!grouped[id]) grouped[id] = [];
        a.__virtualEdits.forEach(edit => {
          grouped[id].push({
            type: "UPDATE",
            time: timestamp,
            submitter: null,
            __virtual: true,
            after: edit.after,
            before: edit.before,
            context: edit.context
          });
        });
      } else if (a.__virtualAction === "create") {
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push({
          type: "CREATE",
          time: timestamp,
          submitter: null,
          __virtual: true,
          after: { startTime: a.startTime, endTime: a.endTime },
          before: null,
          context: a.__virtualContext
        });
      }
    });
    return grouped;
  }, [activities]);

  const activitiesWithIds = activities.map(a => ({
    ...a,
    id: a.id || `${a.type}${a.startTime}`
  }));

  // merge activities with their persisted + virtual events into a flat list
  const entriesWithHistory = React.useMemo(() => {
    const hasHistory = Object.keys(historyByActivityId).length > 0;
    const hasVirtual = Object.keys(virtualEventsByActivityId).length > 0;
    if (!hasHistory && !hasVirtual) return activitiesWithIds;

    const result = [];
    activitiesWithIds.forEach(activity => {
      const persistedEvents = historyByActivityId[activity.id] || [];
      const virtualEvents = virtualEventsByActivityId[activity.id] || [];
      const events = [...persistedEvents, ...virtualEvents];
      if (events.length > 0) {
        const tagType = getEventTagType(events);
        result.push({
          ...activity,
          __hasModification: true,
          __tagType: tagType
        });
        events.forEach((event, idx) => {
          result.push({
            id: `${activity.id}_history_${idx}`,
            __historyEntry: true,
            __event: event,
            __parentId: activity.id
          });
        });
      } else {
        result.push(activity);
      }
    });

    if (simplified) return result;

    // add dismissed activities (not in main query)
    const existingIds = new Set(activitiesWithIds.map(a => a.id));
    const userIds = new Set(
      activitiesWithIds.map(a => a.userId).filter(Boolean)
    );
    const dismissedEntries = [];
    dismissedActivities.forEach(dismissed => {
      if (existingIds.has(dismissed.id)) return;
      if (!userIds.has(dismissed.userId)) return;
      const events = historyByActivityId[dismissed.id];
      if (!events || events.length === 0) return;
      const lastVersion =
        dismissed.versions && dismissed.versions.length > 0
          ? dismissed.versions[dismissed.versions.length - 1]
          : {};
      dismissedEntries.push({
        ...dismissed,
        ...lastVersion,
        id: dismissed.id,
        displayedStartTime: lastVersion.startTime || dismissed.startTime,
        displayedEndTime:
          lastVersion.endTime || dismissed.endTime || dismissed.dismissedAt,
        __hasModification: true,
        __tagType: "SUPPRESSION",
        __historyEvents: events
      });
    });

    // sort all activities chronologically and rebuild with history sub-rows
    const allActivities = [];
    result.forEach(entry => {
      if (!entry.__historyEntry) allActivities.push(entry);
    });
    dismissedEntries.forEach(entry => allActivities.push(entry));
    allActivities.sort(
      (a, b) =>
        (a.displayedStartTime || a.startTime) -
        (b.displayedStartTime || b.startTime)
    );

    const sorted = [];
    allActivities.forEach(activity => {
      sorted.push(activity);
      if (activity.__tagType === "SUPPRESSION" && activity.__historyEvents) {
        activity.__historyEvents.forEach((event, idx) => {
          sorted.push({
            id: `${activity.id}_history_${idx}`,
            __historyEntry: true,
            __event: event,
            __parentId: activity.id
          });
        });
      } else if (activity.__hasModification) {
        const persisted = historyByActivityId[activity.id] || [];
        const virtual = virtualEventsByActivityId[activity.id] || [];
        [...persisted, ...virtual].forEach((event, idx) => {
          sorted.push({
            id: `${activity.id}_history_${idx}`,
            __historyEntry: true,
            __event: event,
            __parentId: activity.id
          });
        });
      }
    });
    return sorted;
  }, [
    activitiesWithIds,
    historyByActivityId,
    virtualEventsByActivityId,
    dismissedActivities
  ]);

  return {
    entriesWithHistory,
    allActivityEvents,
    expandedActivities,
    setExpandedActivities
  };
}
