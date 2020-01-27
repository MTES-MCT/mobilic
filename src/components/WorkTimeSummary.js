import React from "react";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {formatDate, formatDay, formatTimer} from "../utils/time";
import Card from "@material-ui/core/Card";
import ShareIcon from '@material-ui/icons/Share';
import IconButton from "@material-ui/core/IconButton";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {computeTotalActivityDurations} from "../utils/metrics";
import {ACTIVITIES} from "../utils/activities";


function SummaryCard ({ title, handleExport, summaryContent }) {
    return (
        <Card className="summary-card-container unshrinkable">
            <CardContent className="summary-card-content">
                <div className="summary-card-header">
                    <Typography className="summary-card-title">
                        {title}
                    </Typography>
                    <IconButton onClick={handleExport}>
                        <ShareIcon color="primary"/>
                    </IconButton>
                </div>
                <Table size="small">
                    <TableBody>
                        {summaryContent.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">
                                    {row.stat}
                                </TableCell>
                                <TableCell align="right">{row.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export function WorkDaySummary ({ dayEvents, handleExport }) {
    const dayEnd = dayEvents[dayEvents.length - 1].date;
    const dayStart = dayEvents[0].date;
    const timers = computeTotalActivityDurations(dayEvents);
    const serviceTime = timers["total"];
    const workTime = (timers["drive"] || 0) + (timers["work"] || 0);
    const title = `Journée du ${formatDay(dayStart)}`;
    return (
        <SummaryCard
            title={title}
            handleExport={handleExport}
            summaryContent={[
                {
                    stat: "Temps de service",
                    value: `${formatTimer(serviceTime)} (${formatDate(dayStart)}${"\u00A0"}-${"\u00A0"}${formatDate(dayEnd)})`
                },
                {
                    stat: "Temps de travail",
                    value: `${formatTimer(workTime)}`
                },
            ]}
        />
    );
}

export function WorkWeekSummary ({weekEventsByDay, weekStart, handleExport}) {
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
    const title = `Semaine du ${formatDay(weekStart)} - ${formatDay(weekStart + 7 * 86400000)} `;
    const nRests = 0;
    const nValidRests = 0;

    return (
        <SummaryCard
            title={title}
            handleExport={handleExport}
            summaryContent={[
                {
                    stat: "Jours de travail",
                    value: `${weekEventsByDay.length}`
                },
                {
                    stat: "Temps de service",
                    value: `${formatTimer(serviceTime)}`
                },
                {
                    stat: "Temps de travail",
                    value: `${formatTimer(workTime)}`
                },
                {
                    stat: "Respect des repos journaliers",
                    value: `${nRests}/${nValidRests}`
                }
            ]}
        />
    );
}
