import React from "react";
import {TimeLine} from "../components/Timeline";
import {TimeOfService} from "../components/TimeOfService";
import {ActivitySwitchGrid} from "../components/ActivitySwitch";
import Container from "@material-ui/core/Container";


export function CurrentActivity ({ timers, currentActivity, currentDayEvents, pushNewCurrentDayEvent }) {
    return (
        <Container className="container">
            <TimeLine dayEvents={currentDayEvents}/>
            <div style={{flexGrow: 1}} />
            <TimeOfService timer={timers["total"]} />
            <ActivitySwitchGrid
                timers={timers}
                activityOnFocus={currentActivity}
                pushActivitySwitchEvent={pushNewCurrentDayEvent}
            />
        </Container>
    )
}