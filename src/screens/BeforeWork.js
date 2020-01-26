import React from "react";
import Container from "@material-ui/core/Container";
import {WorkDaySummary, WorkWeekSummary} from "../components/WorkTimeSummary";
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import Button from "@material-ui/core/Button";
import {getStartOfWeek} from "../utils/time";
import {computeTotalActivityDurations} from "../utils/metrics";
import {ACTIVITIES} from "../utils/activities";


export function BeforeWork ({ previousDaysEvents, setOpenTeamSelectionModal, setOpenFirstActivityModal, clearTeam }) {
    const latestDayEvents = previousDaysEvents[previousDaysEvents.length - 1];
    let latestDayStart, latestDayEnd, latestWeekStart, latestWeekEvents, latestWeekTimers, timersPerDay;
    if (latestDayEvents) {
        latestDayStart = latestDayEvents[0].date;
        latestDayEnd = latestDayEvents[latestDayEvents.length - 1].date;
        latestWeekStart = getStartOfWeek(latestDayStart);
        latestWeekEvents = previousDaysEvents.filter((dayEvents) => {
            const dayStart = dayEvents[0].date;
            return dayStart > latestWeekStart && dayStart < latestWeekStart + 7 * 86400000;
        });
        timersPerDay = latestWeekEvents.map((dayEvents) => computeTotalActivityDurations(dayEvents, dayEvents[dayEvents.length - 1].date));
        latestWeekTimers = {};
        console.log(timersPerDay);
        timersPerDay.forEach((timer) => {
            Object.values(ACTIVITIES).forEach((activity) => {
                latestWeekTimers[activity.name] = (latestWeekTimers[activity.name] || 0) + (timer[activity.name] || 0)
            });
            latestWeekTimers["total"] = (latestWeekTimers["total"] || 0) + (timer["total"] || 0)
        })
    }

    return (
        <Container className="container scrollable">
            <WorkDaySummary
                timers={timersPerDay && timersPerDay[timersPerDay.length - 1]}
                dayStart={latestDayStart}
                dayEnd={latestDayEnd}
                handleExport={() => console.log("caca")}
            />
            <WorkWeekSummary
                timers={latestWeekTimers}
                nWorkedDays={latestWeekEvents ? latestWeekEvents.length : 0}
                weekStart={latestWeekStart}
                weekEnd={latestWeekStart + 7 * 86400000}
                nRests={0}
                nValidRests={0}
                handleExport={() => console.log("caca")}
            />
            <div style={{height: "5vh", flexGrow: 1}} />
            <div className="start-buttons-container unshrinkable">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonIcon />}
                    onClick={() => {clearTeam(); setOpenFirstActivityModal(true)}}
                >
                    Commencer la journée
                </Button>
                <div style={{height: "2vh"}} />
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    onClick={() => setOpenTeamSelectionModal(true)}
                >
                    Commencer en équipe
                </Button>
            </div>
        </Container>
    )
}