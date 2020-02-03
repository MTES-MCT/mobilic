import React from "react";
import {Container} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import AppBar from "@material-ui/core/AppBar/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {ScrollPicker} from "../components/ScrollPicker";
import {formatDay, getStartOfWeek, MILLISECONDS_IN_A_WEEK, shortPrettyFormatDay} from "../utils/time";
import {WorkDaySummary, WorkWeekSummary} from "../components/WorkTimeSummary";
import {shareEvents} from "../utils/events";


const tabs = {
    day: {
        screen: (props) => null,
        label: "Jour",
        value: "day",
        periodSize: 1,
        getPeriod: (date) => date,
        formatPeriod: shortPrettyFormatDay,
        renderPeriod: (eventsByDay) => (
            <WorkDaySummary
                dayEvents={eventsByDay[0]}
                handleExport={() => shareEvents(eventsByDay)}
            />
        )
    },
    week: {
        screen: (props) => null,
        label: "Semaine",
        value: "week",
        periodSize: 2,
        getPeriod: (date) => getStartOfWeek(date),
        formatPeriod: (date) => `Semaine du ${formatDay(date)} au ${formatDay(date + MILLISECONDS_IN_A_WEEK)}`,
        renderPeriod: (eventsByDay) => (
            <WorkWeekSummary
                weekEventsByDay={eventsByDay}
                handleExport={() => shareEvents(eventsByDay)}
            />
        )
    }
};


export function History ({ previousDaysEventsByDay }) {
    const [currentTab, setCurrentTab] = React.useState("day");

    function groupEventsByPeriod (tab) {
        const periods = [];
        let currentPeriodIndex = -1;
        const eventsGroupedByPeriod = {};
        previousDaysEventsByDay.forEach((dayEvents) => {
            const period = tabs[tab].getPeriod(dayEvents[0].date);
            if (currentPeriodIndex === -1 || period !== periods[currentPeriodIndex]) {
                periods.push(period);
                currentPeriodIndex ++;
                eventsGroupedByPeriod[period] = [];
            }
            eventsGroupedByPeriod[period].push(dayEvents);
        });
        periods.reverse();
        return {periods, eventsGroupedByPeriod}
    }

    const {periods, eventsGroupedByPeriod} = groupEventsByPeriod(currentTab);

    const [selectedPeriod, setSelectedPeriod] = React.useState(periods[0]);

    function handlePeriodChange (e, newTab) {
        const newPeriods = groupEventsByPeriod(newTab).periods;
        let mostRecentNewPeriodIndex = newPeriods.length - 1;
        let newPeriod;
        while (mostRecentNewPeriodIndex > 0 && newPeriods[mostRecentNewPeriodIndex] > selectedPeriod) {
            mostRecentNewPeriodIndex --;
        }
        if (mostRecentNewPeriodIndex === 0 || tabs[newTab].periodSize > tabs[currentTab].periodSize) {
            newPeriod = newPeriods[mostRecentNewPeriodIndex];
        }
        else newPeriod = newPeriods[mostRecentNewPeriodIndex + 1];
        setCurrentTab(newTab);
        setSelectedPeriod(newPeriod);
    }

    return (
        <Container className="container scrollable">
            <AppBar>
              <Toolbar className="app-header stretch-header-content" disableGutters>
                  <Tabs value={currentTab} onChange={handlePeriodChange} style={{flexGrow: 1}} centered>
                      {Object.values(tabs).map((tabProps) => (
                          <Tab label={tabProps.label} value={tabProps.value} style={{flexGrow: 1}} />
                      ))}
                  </Tabs>
              </Toolbar>
            </AppBar>
            <AppBar style={{position: "relative", visibility: "hidden"}}><Toolbar/></AppBar>
            <ScrollPicker
                name="day"
                values={periods.map((period) => ({value: period, label: tabs[currentTab].formatPeriod(period)}))}
                value={selectedPeriod}
                setValue={setSelectedPeriod}
                height={60}
                itemHeight={25}
            />
            <div style={{height: "2vh"}} />
            {tabs[currentTab].renderPeriod(eventsGroupedByPeriod[selectedPeriod])}
        </Container>
    );
}