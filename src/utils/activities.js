import React from "react";
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import BuildIcon from '@material-ui/icons/Build';
import HotelIcon from '@material-ui/icons/Hotel';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';


export const ACTIVITIES = {
    drive: {
        name: "drive",
        label: "Conduite",
        renderIcon: (props) => <LocalShippingIcon {...props} />,
        canBeFirst: true
    },
    work: {
        name: "work",
        label: "Autre tâche",
        renderIcon: (props) => <BuildIcon {...props} />,
        canBeFirst: true
    },
    rest: {
        name: "rest",
        label: "Repos",
        renderIcon: (props) => <HotelIcon {...props} />
    },
    end: {
        name: "end",
        label: "Fin journée",
        renderIcon: (props) => <HighlightOffIcon {...props} />
    }
};
