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


function SummaryCard ({ title, handleExport, summaryContent }) {
    return (
        <Card className="summary-card-container">
            <CardContent className="summary-card-content">
                <div className="summary-card-header">
                    <Typography className="summary-card-title">
                        {title}
                    </Typography>
                    <IconButton onClick={handleExport}>
                        <ShareIcon color="primary"/>
                    </IconButton>
                </div>
                <Table>
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


export function WorkDaySummary ({ timers, dayStart, dayEnd, handleExport }) {
    if (!dayStart) return null;
    const serviceTime = timers["total"];
    const workTime = (timers["drive"] || 0) + (timers["work"] || 0);
    const title = `Résumé du ${formatDay(dayStart)}`
    return (
        <SummaryCard
            title={title}
            handleExport={handleExport}
            summaryContent={[
                {
                    stat: "Temps de service",
                    value: `${formatTimer(serviceTime)} (${formatDate(dayStart)} - ${formatDate(dayEnd)})`
                },
                {
                    stat: "Temps de travail",
                    value: `${formatTimer(workTime)}`
                },
            ]}
        />
    );
}


