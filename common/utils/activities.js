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
  rest: {
    name: "rest",
    label: "Fin journée",
    renderIcon: props => <HighlightOffIcon {...props} />
  }
};

export function parseActivityPayloadFromBackend(activity) {
  return {
    id: activity.id,
    type: activity.type === "support" ? ACTIVITIES.drive.name : activity.type,
    userTime: activity.userTime,
    missionId: activity.missionId,
    driver: activity.driver
  };
}
