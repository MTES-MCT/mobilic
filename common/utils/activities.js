import React from "react";
import { RestIcon, TruckIcon, WorkIcon } from "./icons";
import { now } from "./time";
import forEach from "lodash/forEach";
import maxBy from "lodash/maxBy";
import minBy from "lodash/minBy";

export const SWITCH_ACTIVITIES = {
  drive: {
    name: "drive",
    label: "Déplacement",
    renderIcon: props => <TruckIcon {...props} />,
    color: "#6BE670",
    canBeFirst: true
  },
  work: {
    name: "work",
    label: "Autre tâche",
    renderIcon: props => <WorkIcon {...props} />,
    canBeFirst: true,
    color: "#F3A817"
  },
  break: {
    name: "break",
    label: "Pause",
    renderIcon: props => <RestIcon {...props} />,
    color: "#9A9CF8"
  }
};

export const ACTIVITIES = {
  ...SWITCH_ACTIVITIES,
  support: {
    name: "support",
    label: "Accompagnement",
    renderIcon: props => <TruckIcon {...props} />,
    color: "#6BE670"
  }
};

export const TIMEABLE_ACTIVITIES = {
  drive: ACTIVITIES.drive,
  work: ACTIVITIES.work,
  support: ACTIVITIES.support
};

export function parseActivityPayloadFromBackend(activity) {
  return {
    id: activity.id,
    type: activity.type,
    startTime: activity.startTime,
    endTime: activity.endTime,
    missionId: activity.missionId,
    userId: activity.userId,
    context: activity.context
  };
}

export function sortActivities(activities) {
  return activities.sort((activity1, activity2) => {
    const startTimeDiff = activity1.startTime - activity2.startTime;
    if (startTimeDiff !== 0) return startTimeDiff;
    return (activity1.endTime || Infinity) - (activity2.endTime || Infinity);
  });
}

export function filterActivitiesOverlappingPeriod(
  activities,
  periodStart,
  periodEnd
) {
  return activities.filter(
    a =>
      (!periodStart || !a.endTime || a.endTime > periodStart) &&
      (!periodEnd || a.startTime < periodEnd)
  );
}

export function getCurrentActivityDuration(activity) {
  const activitySwitchTime = activity.endTime || activity.startTime;
  return Math.max(now() - activitySwitchTime, 0);
}

export function getActivityStartTimeToUse(
  latestActivity,
  latestActivitySwitchExactTime
) {
  const latestActivitySwitchTime =
    latestActivity.endTime || latestActivity.startTime;
  const switchTimeDelta = latestActivitySwitchExactTime
    ? latestActivitySwitchExactTime - latestActivitySwitchTime
    : 0;
  return latestActivitySwitchExactTime &&
    switchTimeDelta >= 0 &&
    switchTimeDelta <= 60
    ? latestActivitySwitchExactTime
    : latestActivitySwitchTime;
}

export function convertBreakIntoActivityOperations(
  allActivities,
  startTime,
  endTime,
  selfId,
  extendActivities = false
) {
  const activities = allActivities.filter(a => a.userId === selfId);

  const activitiesStartedBeforeEndingInBetween = activities.filter(
    a =>
      a.startTime < startTime &&
      ((!endTime && (!a.endTime || a.endTime > startTime)) ||
        (endTime && a.endTime && a.endTime > startTime && a.endTime <= endTime))
  );
  const activitiesPurelyInBetween = activities.filter(
    a =>
      a.startTime >= startTime &&
      (!endTime || (a.endTime && a.endTime > startTime && a.endTime <= endTime))
  );
  const activitiesStartedInBetweenEndingAfter = activities.filter(
    a =>
      a.startTime >= startTime &&
      endTime &&
      a.startTime < endTime &&
      (!a.endTime || a.endTime > endTime)
  );
  const activitiesFullyOverlapping = activities
    .filter(
      a =>
        a.startTime < startTime &&
        endTime &&
        (!a.endTime || a.endTime > endTime)
    )
    .map(a => {
      let driverId;
      if ([ACTIVITIES.drive.name, ACTIVITIES.support.name].includes(a.type)) {
        const siblingActivities = allActivities.filter(
          a1 =>
            a1.userId !== a.userId &&
            a1.startTime === a.startTime &&
            a1.endTime === a.endTime
        );

        driverId = -1;
        forEach(siblingActivities, a1 => {
          if (a1.type === ACTIVITIES.drive.name) driverId = a1.userId;
          return false;
        });
      }
      return { ...a, driverId };
    });

  let ops = [];
  activitiesStartedBeforeEndingInBetween.forEach(a =>
    ops.push({
      activity: a,
      operation: "update",
      startTime: a.startTime,
      endTime: startTime
    })
  );
  activitiesPurelyInBetween.forEach(a =>
    ops.push({
      activity: a,
      operation: "cancel"
    })
  );
  activitiesStartedInBetweenEndingAfter.forEach(a =>
    ops.push({
      activity: a,
      operation: "update",
      startTime: endTime,
      endTime: a.endTime
    })
  );
  activitiesFullyOverlapping.forEach(a => {
    if (startTime < endTime)
      ops.push(
        {
          activity: a,
          operation: "update",
          startTime: a.startTime,
          endTime: startTime
        },
        {
          operation: "create",
          type: a.type,
          startTime: endTime,
          endTime: a.endTime
        }
      );
  });

  if (extendActivities) {
    if (
      activitiesStartedBeforeEndingInBetween.length +
        activitiesFullyOverlapping.length ===
      0
    ) {
      const activitiesStartedBefore = activities.filter(
        a => a.startTime < startTime
      );
      const activityRightBefore =
        activitiesStartedBefore.length > 0
          ? maxBy(activitiesStartedBefore, a => a.endTime)
          : null;
      if (activityRightBefore && activityRightBefore.endTime < startTime) {
        ops.push({
          activity: activityRightBefore,
          operation: "update",
          startTime: activityRightBefore.startTime,
          endTime: startTime
        });
      }
    }
    if (
      activitiesFullyOverlapping.length +
        activitiesStartedInBetweenEndingAfter.length ===
      0
    ) {
      const activitiesEndedAfter = activities.filter(
        a => endTime && (!a.endTime || a.endTime > endTime)
      );
      const activityRightAfter =
        activitiesEndedAfter.length > 0
          ? minBy(activitiesEndedAfter, a => a.startTime)
          : null;
      if (activityRightAfter && activityRightAfter.startTime > endTime) {
        ops.push({
          activity: activityRightAfter,
          operation: "update",
          startTime: endTime,
          endTime: activityRightAfter.endTime
        });
      }
    }
  }
  return ops;
}
