import React from "react";
import Container from "@material-ui/core/Container";
import {WorkDaySummary, WorkWeekSummary} from "../components/WorkTimeSummary";
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import Button from "@material-ui/core/Button";
import {getStartOfWeek} from "../utils/time";
import {NotImplementedPlaceHolder} from "../components/NotImplementedPlaceHolder";
import {shareEvents} from "../utils/events";


export function BeforeWork ({ previousDaysEventsByDay, setOpenTeamSelectionModal, setOpenFirstActivityModal, clearTeam }) {
    const latestDayEvents = previousDaysEventsByDay[previousDaysEventsByDay.length - 1];
    let latestDayStart, latestWeekStart, latestWeekEventsByDay;
    if (latestDayEvents) {
        latestDayStart = latestDayEvents[0].date;
        latestWeekStart = getStartOfWeek(latestDayStart);
        latestWeekEventsByDay = previousDaysEventsByDay.filter((dayEvents) => {
            const dayStart = dayEvents[0].date;
            return dayStart > latestWeekStart && dayStart < latestWeekStart + 7 * 86400000;
        });
    }

    return (
        <Container className="container scrollable">
            {latestDayEvents ?
                [
                    <WorkDaySummary
                        dayEvents={latestDayEvents}
                        handleExport={() => shareEvents(latestDayEvents)}
                    />,
                    <WorkWeekSummary
                        weekEventsByDay={latestWeekEventsByDay}
                        weekStart={latestWeekStart}
                        handleExport={() => shareEvents(latestWeekEventsByDay.flatMap(array => array))}
                    />
                ]
                :
                <NotImplementedPlaceHolder
                    label={"Page d'accueil"}
                />
            }
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