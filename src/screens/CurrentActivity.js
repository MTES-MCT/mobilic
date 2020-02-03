import React from "react";
import {TimeLine} from "../components/Timeline";
import {TimeOfService} from "../components/TimeOfService";
import {ActivitySwitchGrid} from "../components/ActivitySwitch";
import Container from "@material-ui/core/Container";
import {computeTotalActivityDurations} from "../utils/metrics";
import Typography from "@material-ui/core/Typography";
import {Expenditures} from "../components/Expenditures";
import Divider from "@material-ui/core/Divider";


export function CurrentActivity ({ currentActivityName, currentDayEvents, pushNewCurrentDayEvent, teamMates, currentDayExpenditures, setCurrentDayExpenditures }) {
    const timers = computeTotalActivityDurations(currentDayEvents, Date.now() + 1);
    return (
        <Container className="container space-between">
            <TimeLine dayEvents={currentDayEvents}/>
            <Divider className="full-width-divider"/>
            {teamMates.length > 0 &&
                [
                    <Typography
                        variant="subtitle1"
                        className="current-team-summary"
                        noWrap
                    >
                        {teamMates.length} coéquipier{teamMates.length > 1 && "s"} : {teamMates.map((mate) => mate.firstName).join(", ")}
                    </Typography>,
                    <Divider className="full-width-divider"/>
                ]

            }
            <ActivitySwitchGrid
                timers={timers}
                activityOnFocus={currentActivityName}
                pushActivitySwitchEvent={pushNewCurrentDayEvent}
            />
            <Divider className="full-width-divider"/>
            <Expenditures
                expenditures={currentDayExpenditures}
                setExpenditures={setCurrentDayExpenditures}
            />
        </Container>
    )
}