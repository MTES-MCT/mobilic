import React from "react";
import { RestIcon, TruckIcon, WorkIcon } from "./icons";

export const SWITCH_ACTIVITIES = {
  drive: {
    name: "drive",
    label: "Déplacement",
    renderIcon: props => <TruckIcon {...props} />,
    canBeFirst: true
  },
  work: {
    name: "work",
    label: "Autre tâche",
    renderIcon: props => <WorkIcon {...props} />,
    canBeFirst: true
  },
  break: {
    name: "break",
    label: "Pause",
    renderIcon: props => <RestIcon {...props} />
  }
};

export const ACTIVITIES = {
  ...SWITCH_ACTIVITIES,
  support: {
    name: "support",
    label: "Accompagnement",
    renderIcon: props => <TruckIcon {...props} />
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
