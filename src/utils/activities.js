import React from "react";
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import BuildIcon from '@material-ui/icons/Build';
import HotelIcon from '@material-ui/icons/Hotel';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';


export const ACTIVITIES = [
    {
        name: "drive",
        label: "Conduite",
        renderIcon: (props) => <LocalShippingIcon {...props} />
    },
    {
        name: "work",
        label: "Travail",
        renderIcon: (props) => <BuildIcon {...props} />,
    },
    {
        name: "rest",
        label: "Repos",
        renderIcon: (props) => <HotelIcon {...props} />
    },
    {
        name: "end",
        label: "Fin de journée",
        renderIcon: (props) => <HighlightOffIcon {...props} />
    }
];

export function getActivityByName (name) {
    return ACTIVITIES.filter((activity) => activity.name === name)[0];
}
