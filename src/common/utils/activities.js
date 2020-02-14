import React from "react";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import BuildIcon from "@material-ui/icons/Build";
import HotelIcon from "@material-ui/icons/Hotel";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";

export const TIMEABLE_ACTIVITIES = {
  drive: {
    name: "drive",
    label: "Conduite",
    renderIcon: props => <LocalShippingIcon {...props} />,
    canBeFirst: true
  },
  work: {
    name: "work",
    label: "Autre tâche",
    renderIcon: props => <BuildIcon {...props} />,
    canBeFirst: true
  },
  break: {
    name: "break",
    label: "Pause",
    renderIcon: props => <HotelIcon {...props} />
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
    eventTime: activity.eventTime,
    companyId: activity.companyId,
    mission: activity.mission,
    vehicleRegistrationNumber: activity.vehicleRegistrationNumber,
    team: activity.team ? activity.team.map(id => ({ id: id })) : []
  };
}
