import React from "react";
import groupBy from "lodash/groupBy";
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
  computeMissionKpis,
  computeWeekKpis,
  WorkTimeSummaryAdditionalInfo,
  WorkTimeSummaryKpiGrid
} from "../components/WorkTimeSummary";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import { getTime } from "common/utils/events";
import { findMatchingPeriodInNewScale } from "common/utils/history";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import { FunnelModal } from "../components/FunnelModal";
import { RegulationCheck } from "../components/RegulationCheck";
import { checkDayRestRespect } from "common/utils/regulation";
import { MissionReviewSection } from "../components/MissionReviewSection";
import Link from "@material-ui/core/Link";
import { MissionDetails } from "../components/MissionDetails";
import Typography from "@material-ui/core/Typography";

const tabs = {
  mission: {
    label: "Mission",
    value: "mission",
    periodSize: 0,
    getPeriod: date => date,
    formatPeriod: shortPrettyFormatDay,
    renderPeriod: ({
      missionsInPeriod,
      followingPeriodStart,
      editActivityEvent,
      createActivity,
      editExpenditures,
      currentMission,
      validateMission
    }) => {
      const mission = missionsInPeriod[0];
      const missionEnd =
        mission.activities[mission.activities.length - 1].endTime;
      return (
        <div>
          {mission.name && (
            <WorkTimeSummaryAdditionalInfo disableTopMargin>
              <Typography className="bold">
                Nom de la mission : {mission.name}
              </Typography>
            </WorkTimeSummaryAdditionalInfo>
          )}
          <WorkTimeSummaryKpiGrid metrics={computeMissionKpis(mission)} />
          <WorkTimeSummaryAdditionalInfo>
            <RegulationCheck
              check={checkDayRestRespect(missionEnd, followingPeriodStart)}
            />
          </WorkTimeSummaryAdditionalInfo>
          <WorkTimeSummaryAdditionalInfo disablePadding>
            <MissionDetails
              inverseColors
              mission={mission}
              editActivityEvent={
                mission.adminValidation ? null : editActivityEvent
              }
              createActivity={mission.adminValidation ? null : createActivity}
              editExpenditures={
                mission.adminValidation ? null : editExpenditures
              }
              nullableEndTimeInEditActivity={
                currentMission ? mission.id === currentMission.id : true
              }
              validateMission={validateMission}
              validationButtonName="Valider"
            />
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
    renderPeriod: ({ missionsInPeriod, handleMissionClick }) => (
      <div>
        <WorkTimeSummaryKpiGrid metrics={computeWeekKpis(missionsInPeriod)} />
        <WorkTimeSummaryAdditionalInfo>
          <MissionReviewSection
            title="Détail par journée"
            className="no-margin-no-padding"
          >
            <List>
              {missionsInPeriod.map((mission, index) => [
                <ListItem
                  key={2 * index}
                  onClick={handleMissionClick(getTime(mission))}
                >
                  <ListItemText disableTypography>
                    <Link
                      component="button"
                      variant="body1"
                      onClick={e => {
                        e.preventDefault();
                      }}
                    >
                      Mission{mission.name ? " " + mission.name : ""} du{" "}
                      {prettyFormatDay(getTime(mission))}
                    </Link>
                  </ListItemText>
                </ListItem>,
                index < missionsInPeriod.length - 1 ? (
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

export function HistoryModal({
  open,
  handleClose,
  missions = [],
  currentMission,
  editActivityEvent,
  createActivity,
  editExpenditures,
  validateMission
}) {
  const [currentTab, setCurrentTab] = React.useState("mission");

  const groupedMissions = groupBy(missions, m =>
    tabs[currentTab].getPeriod(getTime(m))
  );

  const periods = Object.keys(groupedMissions)
    .map(p => parseInt(p))
    .sort();

  const [selectedPeriod, setSelectedPeriod] = React.useState(
    periods[periods.length - 1]
  );

  React.useEffect(() => {
    if (!groupedMissions[selectedPeriod])
      setSelectedPeriod(periods[periods.length - 1]);
  }, [missions]);

  function handlePeriodChange(e, newTab, selectedDate) {
    const newGroups = groupBy(missions, m =>
      tabs[newTab].getPeriod(getTime(m))
    );

    const newPeriods = Object.keys(newGroups)
      .map(p => parseInt(p))
      .sort();

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

  const missionsInSelectedPeriod = groupedMissions[selectedPeriod];
  const followingPeriodStart = periods.find(p => p > selectedPeriod);

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container
        className="flex-column full-height"
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
          {missionsInSelectedPeriod &&
            tabs[currentTab].renderPeriod({
              missionsInPeriod: missionsInSelectedPeriod,
              handleMissionClick: date => e =>
                handlePeriodChange(e, "mission", date),
              followingPeriodStart,
              editActivityEvent,
              createActivity,
              editExpenditures,
              currentMission,
              validateMission
            })}
        </Container>
      </Container>
    </FunnelModal>
  );
}
