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
  rest: {
    name: "rest",
    label: "Pause",
    renderIcon: props => <HotelIcon {...props} />
  }
};

export const ACTIVITIES = {
  ...TIMEABLE_ACTIVITIES,
  end: {
    name: "end",
    label: "Fin journée",
    renderIcon: props => <HighlightOffIcon {...props} />
  }
};
