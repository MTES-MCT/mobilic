import React from "react";
import {TimeLine} from "../components/Timeline";
import {TimeOfService} from "../components/TimeOfService";
import {ActivitySwitchGrid} from "../components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import {computeTotalActivityDurations} from "../utils/metrics";
import Typography from "@material-ui/core/Typography";


export function CurrentActivity ({ currentActivityName, currentDayEvents, pushNewCurrentDayEvent, teamMates, setOpenTeamSelectionModal }) {
    const timers = computeTotalActivityDurations(currentDayEvents, Date.now() + 1);
    return (
        <Container className="container space-between">
            <TimeLine dayEvents={currentDayEvents}/>
            <TimeOfService timer={timers["total"]} />
            {teamMates.length > 0 &&
                <Typography
                    variant="subtitle1"
                    className="current-team-summary"
                >
                    {teamMates.length} coéquipier{teamMates.length > 1 && "s"} : {teamMates.map((mate) => mate.firstName).join(", ")}
                </Typography>
            }
            <ActivitySwitchGrid
                timers={timers}
                activityOnFocus={currentActivityName}
                pushActivitySwitchEvent={pushNewCurrentDayEvent}
            />
        </Container>
    )
}