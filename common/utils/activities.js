import React from "react";
import { RestIcon, TruckIcon, WorkIcon } from "./icons";
import { now } from "./time";

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
