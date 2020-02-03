import React from "react";
import Typography from "@material-ui/core/Typography";
import {
    formatTimeOfDay,
    formatDay,
    formatTimer,
    getStartOfWeek,
    MILLISECONDS_IN_A_WEEK,
    shortPrettyFormatDay, prettyFormatDay
} from "../utils/time";
import Box from "@material-ui/core/Box";
import ShareIcon from '@material-ui/icons/Share';
import IconButton from "@material-ui/core/IconButton";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {computeTotalActivityDurations} from "../utils/metrics";
import {ACTIVITIES, TIMEABLE_ACTIVITIES} from "../utils/activities";


function Summary ({ title, handleExport, summaryContent, timers }) {
    return (
        <div className="summary-card-container unshrinkable">
            <Box className="summary-card-header">
                <Typography className="summary-card-title">
                    {title}
                </Typography>
                <IconButton onClick={handleExport}>
                    <ShareIcon color="primary"/>
                </IconButton>
            </Box>
            <Table>
                <TableBody>
                    {summaryContent.map((row, index) => (
                        <TableRow key={index}>
                            <TableCell className="summary-card-table-cell" component="th" scope="row">
                                <Typography variant="body2">
                                    {row.stat}
                                </Typography>
                            </TableCell>
                            <TableCell className="summary-card-table-cell" align="right">
                                <Typography variant="body2" className="summary-card-table-cell-value">
                                    {row.value}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="summary-card-timers">
                {timers && Object.values(TIMEABLE_ACTIVITIES).map((activity) =>
                    <div className="summary-card-timer">
                        {activity.renderIcon({className: "activity-card-icon"})}
                        <Typography variant="body2">
                            {` : ${formatTimer(timers[activity.name] || 10)}`}
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    )
}


export function WorkDaySummary ({ dayEvents, handleExport }) {
    const dayEnd = dayEvents[dayEvents.length - 1].date;
    const dayStart = dayEvents[0].date;
    const timers = computeTotalActivityDurations(dayEvents);
    const serviceTime = timers["total"];
    const workTime = (timers["drive"] || 0) + (timers["work"] || 0);
    const title = `Journée du ${prettyFormatDay(dayStart)}`;
    return (
        <Summary
            title={title}
            handleExport={handleExport}
            summaryContent={[
                {
                    stat: "Amplitude 📅",
                    value: `${formatTimer(serviceTime)} (${formatTimeOfDay(dayStart)}${"\u00A0"}-${"\u00A0"}${formatTimeOfDay(dayEnd)})`
                },
                {
                    stat: "Travail 💪",
                    value: `${formatTimer(workTime)}`
                },
            ]}
            timers={timers}
        />
    );
}

export function WorkWeekSummary ({weekEventsByDay, handleExport}) {
    const weekStart = getStartOfWeek(weekEventsByDay[0][0].date);
    const timersPerDay = weekEventsByDay.map((dayEvents) => computeTotalActivityDurations(dayEvents));
    const weekTimers = {};
    timersPerDay.forEach((timer) => {
        Object.values(ACTIVITIES).forEach((activity) => {
            weekTimers[activity.name] = (weekTimers[activity.name] || 0) + (timer[activity.name] || 0)
        });
        weekTimers["total"] = (weekTimers["total"] || 0) + (timer["total"] || 0)
    });

    const serviceTime = weekTimers["total"];
    const workTime = (weekTimers["drive"] || 0) + (weekTimers["work"] || 0);
    const title = `Semaine du ${shortPrettyFormatDay(weekStart)} - ${shortPrettyFormatDay(weekStart + MILLISECONDS_IN_A_WEEK)} `;
    const nRests = 0;
    const nValidRests = 0;

    return (
        <Summary
            title={title}
            handleExport={handleExport}
            summaryContent={[
                {
                    stat: "Jours de travail 💪",
                    value: `${weekEventsByDay.length}`
                },
                {
                    stat: "Amplitude totale 📅",
                    value: `${formatTimer(serviceTime)}`
                },
                {
                    stat: "Travail total 💪",
                    value: `${formatTimer(workTime)}`
                },
                {
                    stat: "Repos journaliers valides 😴",
                    value: `${nRests}/${nValidRests}`
                }
            ]}
        />
    );
}
