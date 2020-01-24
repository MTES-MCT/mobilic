import React from "react";
import {TimeLine} from "../components/Timeline";
import {TimeOfService} from "../components/TimeOfService";
import {ActivitySwitchGrid} from "../components/ActivitySwitch";
import {ACTIVITIES} from "../utils/activities";
import Container from "@material-ui/core/Container";


export function CurrentActivity ({ timers, currentActivity, setCurrentActivity, currentDayEvents, pushNewCurrentDayEvent }) {
    return (
        <Container className="container">
            <TimeLine width="80vw" height="3vh" dayEvents={currentDayEvents}/>
            <TimeOfService timer={timers["total"]} />
            <ActivitySwitchGrid
                activities={ACTIVITIES}
                timers={timers}
                activityOnFocus={currentActivity}
                setActivityOnFocus={setCurrentActivity}
                pushActivitySwitchEvent={pushNewCurrentDayEvent}
            />
        </Container>
    )
}