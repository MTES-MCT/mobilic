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

function getActivitiesStartedBeforeEndingInBetween(
  activities,
  startTime,
  endTime
) {
  return activities.filter(
    a =>
      a.startTime < startTime &&
      ((!endTime && (!a.endTime || a.endTime > startTime)) ||
        (endTime && a.endTime && a.endTime > startTime && a.endTime <= endTime))
  );
}

function getActivitiesPurelyInBetween(activities, startTime, endTime) {
  return activities.filter(
    a =>
      a.startTime >= startTime &&
      (!endTime || (a.endTime && a.endTime > startTime && a.endTime <= endTime))
  );
}

function getActivitiesStartedInBetweenEndingAfter(
  activities,
  startTime,
  endTime
) {
  return activities.filter(
    a =>
      a.startTime >= startTime &&
      endTime &&
      a.startTime < endTime &&
      (!a.endTime || a.endTime > endTime)
  );
}

function getActivitiesFullyOverlapping(
  activities,
  startTime,
  endTime,
  allActivities
) {
  return activities
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
}

function extendExistingActivitiesToPeriodBoundariesOps(
  activities,
  startTime,
  endTime,
  activitiesStartedBeforeEndingInBetween,
  activitiesStartedInBetweenEndingAfter,
  activitiesFullyOverlapping
) {
  const ops = [];
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
  return ops;
}

export function convertBreakIntoActivityOperations(
  allActivities,
  startTime,
  endTime,
  userId,
  extendActivities = false
) {
  const activities = allActivities.filter(a => a.userId === userId);

  const activitiesStartedBeforeEndingInBetween = getActivitiesStartedBeforeEndingInBetween(
    activities,
    startTime,
    endTime
  );
  const activitiesPurelyInBetween = getActivitiesPurelyInBetween(
    activities,
    startTime,
    endTime
  );
  const activitiesStartedInBetweenEndingAfter = getActivitiesStartedInBetweenEndingAfter(
    activities,
    startTime,
    endTime
  );
  const activitiesFullyOverlapping = getActivitiesFullyOverlapping(
    activities,
    startTime,
    endTime,
    allActivities
  );

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
    ops.push(
      ...extendExistingActivitiesToPeriodBoundariesOps(
        activities,
        startTime,
        endTime,
        activitiesStartedBeforeEndingInBetween,
        activitiesStartedInBetweenEndingAfter,
        activitiesFullyOverlapping
      )
    );
  }
  return ops;
}

export function addBreakToActivityList(activities) {
  const activitiesWithBreaks = [];
  sortActivities(activities);
  activities.forEach((a, index) => {
    activitiesWithBreaks.push(a);
    if (index < activities.length - 1) {
      const nextA = activities[index + 1];
      if (a.endTime < nextA.startTime)
        activitiesWithBreaks.push({
          type: ACTIVITIES.break.name,
          startTime: a.endTime,
          endTime: nextA.startTime
        });
    }
  });
  return activitiesWithBreaks;
}

export function computeDurationAndTime(activities, fromTime, untilTime) {
  const dateNow = now();
  return activities.map(activity => {
    const startTime = Math.max(activity.startTime, fromTime);
    const endTime = untilTime
      ? Math.min(activity.endTime || dateNow, untilTime)
      : activity.endTime;
    const endTimeOrNow = endTime || dateNow;
    return {
      ...activity,
      displayedStartTime: startTime,
      displayedEndTime: endTime,
      endTimeOrNow,
      duration: endTimeOrNow - startTime
    };
  });
}
