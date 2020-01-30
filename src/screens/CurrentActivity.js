import React from "react";
import {TimeLine} from "../components/Timeline";
import {TimeOfService} from "../components/TimeOfService";
import {ActivitySwitchGrid} from "../components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import Link from '@material-ui/core/Link';
import {computeTotalActivityDurations} from "../utils/metrics";


export function CurrentActivity ({ currentActivityName, currentDayEvents, pushNewCurrentDayEvent, teamMates, setOpenTeamSelectionModal }) {
    const timers = computeTotalActivityDurations(currentDayEvents, Date.now() + 1);
    return (
        <Container className="container space-between">
            <TimeLine dayEvents={currentDayEvents}/>
            <TimeOfService timer={timers["total"]} />
            {teamMates.length > 0 &&
                <Link
                    className="current-team-summary"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setOpenTeamSelectionModal(true);
                    }}
                >
                    Coéquipiers : {teamMates.length}
                </Link>
            }
            <ActivitySwitchGrid
                timers={timers}
                activityOnFocus={currentActivityName}
                pushActivitySwitchEvent={pushNewCurrentDayEvent}
            />
        </Container>
    )
}