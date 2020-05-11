import React from "react";
import { Container } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  formatDay,
  getStartOfWeek,
  WEEK,
  prettyFormatDay,
  shortPrettyFormatDay
} from "common/utils/time";
import {
  computeDayKpis,
  computeWeekKpis,
  WorkTimeSummaryKpiGrid
} from "../components/WorkTimeSummary";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import { TimeLine } from "../components/Timeline";
import Box from "@material-ui/core/Box";
import { getTime, groupDayActivityEventsByPeriod } from "common/utils/events";
import { findMatchingPeriodInNewScale } from "common/utils/history";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import { FunnelModal } from "../components/FunnelModal";

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
          <WorkTimeSummaryKpiGrid metrics={computeDayKpis(dayActivityEvents)} />
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
        <WorkTimeSummaryKpiGrid
          metrics={computeWeekKpis(activityEventsByDay)}
        />
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

const useStyles = makeStyles(theme => ({
  contentContainer: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "24px 24px 0 0",
    flexGrow: 1,
    paddingTop: theme.spacing(4),
    textAlign: "center"
  },
  periodSelector: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2)
  }
}));

export function HistoryModal({ open, handleClose, activityEventsByDay = [] }) {
  const [currentTab, setCurrentTab] = React.useState("day");

  const { periods, eventsGroupedByPeriod } = groupDayActivityEventsByPeriod(
    activityEventsByDay,
    tabs[currentTab].getPeriod
  );

  const [selectedPeriod, setSelectedPeriod] = React.useState(
    periods[periods.length - 1]
  );

  React.useEffect(() => setSelectedPeriod(periods[periods.length - 1]), [
    activityEventsByDay
  ]);

  function handlePeriodChange(e, newTab, selectedDate) {
    const newPeriods = groupDayActivityEventsByPeriod(
      activityEventsByDay,
      tabs[newTab].getPeriod
    ).periods;
    const newPeriod = findMatchingPeriodInNewScale(
      selectedDate,
      newPeriods,
      tabs[currentTab].periodSize,
      tabs[newTab].periodSize
    );
    setCurrentTab(newTab);
    setSelectedPeriod(newPeriod);
  }

  const classes = useStyles();

  const selectedPeriodEvents = eventsGroupedByPeriod[selectedPeriod];
  console.log(eventsGroupedByPeriod);

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container
        className="flex-column full-height scrollable"
        disableGutters
        maxWidth={false}
      >
        <Container className={classes.periodSelector} maxWidth={false}>
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
          <PeriodCarouselPicker
            periods={periods}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </Container>
        <Container
          className={`scrollable ${classes.contentContainer}`}
          maxWidth={false}
        >
          {selectedPeriodEvents &&
            tabs[currentTab].renderPeriod({
              activityEventsByDay: selectedPeriodEvents.events,
              handleDayClick: date => e => handlePeriodChange(e, "day", date),
              followingPeriodStart: selectedPeriodEvents.followingPeriodStart
            })}
        </Container>
      </Container>
    </FunnelModal>
  );
}
