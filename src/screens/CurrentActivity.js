import React from "react";
import {TimeLine} from "../components/Timeline";
import {TimeOfService} from "../components/TimeOfService";
import {ActivitySwitchGrid} from "../components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import Link from '@material-ui/core/Link';


export function CurrentActivity ({ timers, currentActivityName, currentDayEvents, pushNewCurrentDayEvent, teamMates, setOpenTeamSelectionModal }) {
    return (
        <Container className="container">
            <TimeLine dayEvents={currentDayEvents}/>
            <div style={{flexGrow: 1}} />
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
            <TimeOfService timer={timers["total"]} />
            <ActivitySwitchGrid
                timers={timers}
                activityOnFocus={currentActivityName}
                pushActivitySwitchEvent={pushNewCurrentDayEvent}
            />
        </Container>
    )
}