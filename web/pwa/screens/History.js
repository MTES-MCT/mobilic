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
  WorkTimeSummaryAdditionalInfo,
  WorkTimeSummaryKpiGrid
} from "../components/WorkTimeSummary";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import { getTime, groupDayActivityEventsByPeriod } from "common/utils/events";
import { findMatchingPeriodInNewScale } from "common/utils/history";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import { FunnelModal } from "../components/FunnelModal";
import { RegulationCheck } from "../components/RegulationCheck";
import { checkDayRestRespect } from "common/utils/regulation";
import { MissionReviewSection } from "../components/MissionReviewSection";
import Link from "@material-ui/core/Link";
import { MissionDetails } from "../components/MissionDetails";

const tabs = {
  day: {
    label: "Jour",
    value: "day",
    periodSize: 1,
    getPeriod: date => date,
    formatPeriod: shortPrettyFormatDay,
    renderPeriod: ({
      activityEventsByDay,
      mission,
      followingPeriodStart,
      classes
    }) => {
      const dayActivityEvents = activityEventsByDay[0];
      const dayEnd = getTime(dayActivityEvents[dayActivityEvents.length - 1]);
      return (
        <div>
          <WorkTimeSummaryKpiGrid metrics={computeDayKpis(dayActivityEvents)} />
          <WorkTimeSummaryAdditionalInfo>
            <RegulationCheck
              check={checkDayRestRespect(dayEnd, followingPeriodStart)}
            />
          </WorkTimeSummaryAdditionalInfo>
          <WorkTimeSummaryAdditionalInfo>
            <MissionDetails mission={mission} />
          </WorkTimeSummaryAdditionalInfo>
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
        <WorkTimeSummaryAdditionalInfo>
          <MissionReviewSection
            title="Détail par journée"
            className="no-margin-no-padding"
          >
            <List>
              {activityEventsByDay.map((dayActivityEvents, index) => [
                <ListItem
                  key={2 * index}
                  onClick={handleDayClick(getTime(dayActivityEvents[0]))}
                >
                  <ListItemText disableTypography>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={e => {
                        e.preventDefault();
                      }}
                    >
                      {prettyFormatDay(getTime(dayActivityEvents[0]))}
                    </Link>
                  </ListItemText>
                </ListItem>,
                index < activityEventsByDay.length - 1 ? (
                  <Divider key={2 * index + 1} component="li" />
                ) : null
              ])}
            </List>
          </MissionReviewSection>
        </WorkTimeSummaryAdditionalInfo>
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
  },
  dayAdditionalInfo: {
    marginTop: theme.spacing(4)
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
          {periods.length > 0 && (
            <PeriodCarouselPicker
              periods={periods}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          )}
        </Container>
        <Container className={classes.contentContainer} maxWidth={false}>
          {selectedPeriodEvents &&
            tabs[currentTab].renderPeriod({
              activityEventsByDay: selectedPeriodEvents.events,
              handleDayClick: date => e => handlePeriodChange(e, "day", date),
              followingPeriodStart: selectedPeriodEvents.followingPeriodStart,
              classes
            })}
        </Container>
      </Container>
    </FunnelModal>
  );
}
