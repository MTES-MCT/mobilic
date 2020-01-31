import {ACTIVITIES} from "./activities";
import {BeforeWork} from "../screens/BeforeWork";
import {CurrentActivity} from "../screens/CurrentActivity";
import React from "react";
import TimerIcon from '@material-ui/icons/Timer';
import TimelineIcon from '@material-ui/icons/Timeline';
import {NotImplementedPlaceHolder} from "../components/NotImplementedPlaceHolder";
import BottomNavBar from "../components/BottomNavBar";
import {History} from "../screens/History";


const SCREENS_WITH_BOTTOM_NAVIGATION = {
    activity: {
        name: "activity",
        label: "Activité",
        renderIcon: (props) => <TimerIcon {...props}/>,
        render: (props) => (
            (props.currentActivityName === ACTIVITIES.end.name) ?
                <BeforeWork
                    {...props}
                />
                :
                <CurrentActivity
                    {...props}
                />
        )
    },
    history: {
        name: "history",
        label: "Historique",
        renderIcon: (props) => <TimelineIcon {...props}/>,
        render: () => (
            <History/>
        )
    }
};

export function ScreenWithBottomNavigation (props) {
    const [screen, setScreen] = React.useState(SCREENS_WITH_BOTTOM_NAVIGATION.activity.name);
    return (
        [
            SCREENS_WITH_BOTTOM_NAVIGATION[screen].render(props),
            <BottomNavBar screens={SCREENS_WITH_BOTTOM_NAVIGATION} currentScreen={screen} setCurrentScreen={setScreen} />
        ]
    )
}
