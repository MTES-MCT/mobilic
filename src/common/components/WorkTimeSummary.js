import React from "react";
import Typography from "@material-ui/core/Typography";
import {
  formatTimeOfDay,
  formatTimer,
  getStartOfWeek,
  WEEK,
  shortPrettyFormatDay,
  prettyFormatDay
} from "../utils/time";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { computeTotalActivityDurations } from "../utils/metrics";
import { ACTIVITIES, TIMEABLE_ACTIVITIES } from "../utils/activities";
import useTheme from "@material-ui/core/styles/useTheme";
import { checkDayRestRespect } from "../utils/regulation";
import { RegulationCheck } from "./RegulationCheck";
import Divider from "@material-ui/core/Divider";

function Summary({ title, summaryContent, timers, alerts }) {
  const theme = useTheme();
  return (
    <div className="unshrinkable">
      <Box className="summary-card-header">
        <Typography className="bold">{title}</Typography>
      </Box>
      <Table>
        <TableBody>
          {summaryContent.map((row, index) => (
            <TableRow key={index}>
              <TableCell
                className="summary-card-table-cell"
                component="th"
                scope="row"
              >
                <Typography variant="body2">{row.stat}</Typography>
              </TableCell>
              <TableCell className="summary-card-table-cell" align="right">
                <Typography
                  variant="body2"
                  className="summary-card-table-cell-value"
                >
                  {row.value}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {timers && (
        <div className="summary-card-timers">
          {Object.values(TIMEABLE_ACTIVITIES).map((activity, index) => (
            <div key={index} className="summary-card-timer">
              {activity.renderIcon({
                className: "activity-card-icon",
                style: { color: theme.palette[activity.name] }
              })}
              <Typography variant="body2">
                {` : ${formatTimer(timers[activity.name] || 10)}`}
              </Typography>
            </div>
          ))}
        </div>
      )}
      {alerts && (
        <div className="alerts-container">
          <Divider />
          {alerts.map((alert, index) => (
            <RegulationCheck key={index} check={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkDaySummary({ dayEvents, followingDayStart }) {
  const dayEnd = dayEvents[dayEvents.length - 1].eventTime;
  const dayStart = dayEvents[0].eventTime;
  const timers = computeTotalActivityDurations(dayEvents);
  const serviceTime = timers["total"];
  const workTime = (timers["drive"] || 0) + (timers["work"] || 0);
  const title = `Journée du ${prettyFormatDay(dayStart)}`;
  return (
    <Summary
      title={title}
      summaryContent={[
        {
          stat: "Amplitude 📅",
          value: `${formatTimer(serviceTime)} (${formatTimeOfDay(
            dayStart
          )}${"\u00A0"}-${"\u00A0"}${formatTimeOfDay(dayEnd)})`
        },
        {
          stat: "Travail 💪",
          value: `${formatTimer(workTime)}`
        }
      ]}
      timers={timers}
      alerts={[checkDayRestRespect(dayEnd, followingDayStart)]}
    />
  );
}

export function WorkWeekSummary({ weekEventsByDay }) {
  const weekStart = getStartOfWeek(weekEventsByDay[0][0].eventTime);
  const timersPerDay = weekEventsByDay.map(dayEvents =>
    computeTotalActivityDurations(dayEvents)
  );
  const weekTimers = {};
  timersPerDay.forEach(timer => {
    Object.values(ACTIVITIES).forEach(activity => {
      weekTimers[activity.name] =
        (weekTimers[activity.name] || 0) + (timer[activity.name] || 0);
    });
    weekTimers["total"] = (weekTimers["total"] || 0) + (timer["total"] || 0);
  });

  const serviceTime = weekTimers["total"];
  const workTime = (weekTimers["drive"] || 0) + (weekTimers["work"] || 0);
  const title = `Semaine du ${shortPrettyFormatDay(
    weekStart
  )} - ${shortPrettyFormatDay(weekStart + WEEK)} `;
  const nRests = 0;
  const nValidRests = 0;
  return (
    <Summary
      title={title}
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
