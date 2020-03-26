import React from "react";
import { Container } from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { ScrollPicker } from "../components/ScrollPicker";
import {
  formatDay,
  getStartOfWeek,
  WEEK,
  prettyFormatDay,
  shortPrettyFormatDay
} from "../../common/utils/time";
import {
  WorkDaySummary,
  WorkWeekSummary
} from "../../common/components/WorkTimeSummary";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import { TimeLine } from "../../common/components/Timeline";
import Box from "@material-ui/core/Box";
import { getTime } from "../../common/utils/events";

const tabs = {
  day: {
    label: "Jour",
    value: "day",
    periodSize: 1,
    getPeriod: date => date,
    formatPeriod: shortPrettyFormatDay,
    renderPeriod: ({ activityEventsByDay, followingPeriodStart }) => {
      const dayActivityEvents = activityEventsByDay[0];
      return (
        <div>
          <WorkDaySummary
            dayActivityEvents={dayActivityEvents}
            followingDayStart={followingPeriodStart}
          />
          <Box mt={3}>
            <TimeLine dayActivityEvents={dayActivityEvents} />
          </Box>
        </div>
      );
    }
  },
  week: {
    label: "Semaine",
    value: "week",
    periodSize: 2,
    getPeriod: date => getStartOfWeek(date),
    formatPeriod: date =>
      `Semaine du ${formatDay(date)} au ${formatDay(date + WEEK)}`,
    renderPeriod: ({ activityEventsByDay, handleDayClick }) => (
      <div>
        <WorkWeekSummary weekActivityEventsByDay={activityEventsByDay} />
        <Box mt={3} ml={-2}>
          <List className="days scrollable">
            {activityEventsByDay.map((dayActivityEvents, index) => [
              <Divider key={2 * index} />,
              <ListItem
                button
                key={2 * index + 1}
                onClick={handleDayClick(getTime(dayActivityEvents[0]))}
              >
                <ListItemText
                  primaryTypographyProps={{ noWrap: true, display: "block" }}
                  primary={prettyFormatDay(getTime(dayActivityEvents[0]))}
                />
              </ListItem>
            ])}
          </List>
        </Box>
      </div>
    )
  }
};

export function History({ previousDaysActivityEventsByDay }) {
  const [currentTab, setCurrentTab] = React.useState("day");

  function groupEventsByPeriod(tab) {
    const periods = [];
    let currentPeriodIndex = -1;
    const eventsGroupedByPeriod = {};
    previousDaysActivityEventsByDay.forEach(dayEvents => {
      const period = tabs[tab].getPeriod(getTime(dayEvents[0]));
      if (currentPeriodIndex === -1 || period !== periods[currentPeriodIndex]) {
        if (currentPeriodIndex >= 0)
          eventsGroupedByPeriod[
            periods[currentPeriodIndex]
          ].followingPeriodStart = period;
        periods.push(period);
        currentPeriodIndex++;
        eventsGroupedByPeriod[period] = {
          followingPeriodStart: undefined,
          events: []
        };
      }
      eventsGroupedByPeriod[period].events.push(dayEvents);
    });
    periods.reverse();
    return { periods, eventsGroupedByPeriod };
  }

  const { periods, eventsGroupedByPeriod } = groupEventsByPeriod(currentTab);

  const [selectedPeriod, setSelectedPeriod] = React.useState(periods[0]);

  function handlePeriodChange(e, newTab, selectedDate) {
    const newPeriods = groupEventsByPeriod(newTab).periods;
    let mostRecentNewPeriodIndex = 0;
    let newPeriod;
    while (
      mostRecentNewPeriodIndex < newPeriods.length - 1 &&
      newPeriods[mostRecentNewPeriodIndex] > selectedDate
    ) {
      mostRecentNewPeriodIndex++;
    }
    if (
      selectedDate === newPeriods[mostRecentNewPeriodIndex] ||
      mostRecentNewPeriodIndex === newPeriods.length - 1 ||
      mostRecentNewPeriodIndex === 0 ||
      tabs[newTab].periodSize > tabs[currentTab].periodSize
    ) {
      newPeriod = newPeriods[mostRecentNewPeriodIndex];
    } else newPeriod = newPeriods[mostRecentNewPeriodIndex - 1];
    setCurrentTab(newTab);
    setSelectedPeriod(newPeriod);
  }

  return (
    <Container className="scrollable" maxWidth={false}>
      <AppBar>
        <Toolbar
          className="flex-row-space-between stretch-header-content"
          disableGutters
        >
          <Tabs
            value={currentTab}
            onChange={(e, tab) => handlePeriodChange(e, tab, selectedPeriod)}
            style={{ flexGrow: 1 }}
            centered
          >
            {Object.values(tabs).map((tabProps, index) => (
              <Tab
                key={index}
                label={tabProps.label}
                value={tabProps.value}
                style={{ flexGrow: 1 }}
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <AppBar style={{ position: "relative", visibility: "hidden" }}>
        <Toolbar />
      </AppBar>
      <ScrollPicker
        name="day"
        values={periods.map(period => ({
          value: period,
          label: tabs[currentTab].formatPeriod(period)
        }))}
        value={selectedPeriod}
        setValue={setSelectedPeriod}
        height={60}
        itemHeight={25}
      />
      <div style={{ height: "2vh" }} />
      {tabs[currentTab].renderPeriod({
        activityEventsByDay: eventsGroupedByPeriod[selectedPeriod].events,
        handleDayClick: date => e => handlePeriodChange(e, "day", date),
        followingPeriodStart:
          eventsGroupedByPeriod[selectedPeriod].followingPeriodStart
      })}
    </Container>
  );
}
