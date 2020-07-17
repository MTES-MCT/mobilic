import React from "react";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { RestIcon, TruckIcon, WorkIcon } from "./icons";

export const TIMEABLE_ACTIVITIES = {
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
  ...TIMEABLE_ACTIVITIES,
  support: {
    name: "support",
    label: "Accompagnement",
    renderIcon: props => <TruckIcon {...props} />
  },
  rest: {
    name: "rest",
    label: "Fin journée",
    renderIcon: props => <HighlightOffIcon {...props} />
  }
};

export function parseActivityPayloadFromBackend(activity) {
  return {
    id: activity.id,
    type: activity.type,
    startTime: activity.startTime,
    missionId: activity.missionId,
    userId: activity.userId,
    context: activity.context
  };
}
