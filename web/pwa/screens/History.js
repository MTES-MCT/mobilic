import React from "react";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import { Container } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  getStartOfWeek,
  prettyFormatDay,
  getStartOfMonth,
  SHORT_MONTHS,
  shortPrettyFormatDay,
  DAY,
  startOfDay,
  WEEK,
  HOUR
} from "common/utils/time";
import {
  computeMissionKpis,
  computePeriodKpis,
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
import { RegulationCheck } from "../components/RegulationCheck";
import { checkDayRestRespect } from "common/utils/regulation";
import { MissionReviewSection } from "../components/MissionReviewSection";
import Link from "@material-ui/core/Link";
import { MissionDetails } from "../components/MissionDetails";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { AccountButton } from "../components/AccountButton";
import { useLocation, useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { NoDataImage } from "common/utils/icons";

const tabs = {
  mission: {
    label: "Mission",
    value: "mission",
    periodSize: 0,
    getPeriod: date => date,
    renderPeriod: ({
      missionsInPeriod,
      followingPeriodStart,
      editActivityEvent,
      createActivity,
      editExpenditures,
      currentMission,
      validateMission,
      logComment,
      cancelComment
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
              logComment={logComment}
              cancelComment={cancelComment}
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
    formatPeriod: period => {
      return (
        <Box className="flex-column-space-between">
          <Typography className="bold">
            {shortPrettyFormatDay(period)}
          </Typography>
          <Typography style={{ lineHeight: 0 }}>-</Typography>
          <Typography>{shortPrettyFormatDay(period + DAY * 7)}</Typography>
        </Box>
      );
    },
    getPeriod: date => getStartOfWeek(date),
    renderPeriod: ({ missionsInPeriod, handleMissionClick }) => (
      <div>
        <WorkTimeSummaryKpiGrid metrics={computePeriodKpis(missionsInPeriod)} />
        <WorkTimeSummaryAdditionalInfo>
          <MissionReviewSection
            title="Détail par mission"
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
                      style={{ textAlign: "justify" }}
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
  },
  month: {
    label: "Mois",
    value: "month",
    periodSize: 3,
    getPeriod: date => getStartOfMonth(date),
    renderPeriod: ({ missionsInPeriod }) => (
      <div>
        <WorkTimeSummaryKpiGrid metrics={computePeriodKpis(missionsInPeriod)} />
      </div>
    ),
    formatPeriod: period => {
      const periodDate = new Date(period * 1000);
      return (
        <Box className="flex-column-space-between">
          <Typography variant="h5">
            {SHORT_MONTHS[periodDate.getMonth()]}
          </Typography>
          <Typography>{periodDate.getFullYear()}</Typography>
        </Box>
      );
    }
  }
};

const useStyles = makeStyles(theme => ({
  contentContainer: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "24px 24px 0 0",
    flexGrow: 1,
    flexShrink: 0,
    paddingTop: theme.spacing(4),
    textAlign: "center"
  },
  placeholderContainer: {
    backgroundColor: "inherit",
    color: theme.palette.grey[500]
  },
  periodSelector: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2)
  },
  dayAdditionalInfo: {
    marginTop: theme.spacing(4)
  },
  fullScreen: {
    width: "100%",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column"
  },
  placeholder: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }
}));

function fillHistoryPeriods(periods, step) {
  if (!["mission", "month", "week"].includes(step)) return periods;

  const allPeriods = [];
  let continuousPeriod = startOfDay(new Date(periods[0] * 1000));
  let index = 0;
  while (index <= periods.length - 1) {
    const currentActualPeriod = periods[index];
    if (continuousPeriod > currentActualPeriod) {
      allPeriods.push(currentActualPeriod);
      index = index + 1;
    } else {
      let continuousPeriodEnd;
      if (step === "mission") {
        continuousPeriodEnd = startOfDay(
          new Date((continuousPeriod + DAY + HOUR) * 1000)
        );
      } else if (step === "week") {
        continuousPeriodEnd = startOfDay(
          new Date((continuousPeriod + WEEK + HOUR) * 1000)
        );
      } else if (step === "month") {
        continuousPeriodEnd = getStartOfMonth(continuousPeriod + DAY * 32);
      }

      if (currentActualPeriod >= continuousPeriodEnd) {
        if (
          step !== "mission" ||
          ![0, 6].includes(new Date(continuousPeriod * 1000).getDay())
        )
          allPeriods.push(continuousPeriod);
      }
      continuousPeriod = continuousPeriodEnd;
    }
  }
  return allPeriods;
}

export function History({
  missions = [],
  currentMission,
  editActivityEvent,
  createActivity,
  editExpenditures,
  validateMission,
  logComment,
  cancelComment
}) {
  const location = useLocation();
  const history = useHistory();

  const onBackButtonClick = location.state
    ? () => history.push(location.state.previousPagePath)
    : null;

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const mission = queryString.get("mission");
    if (mission) {
      const selectedMission = missions.find(m => m.id === parseInt(mission));
      const missionPeriod = selectedMission
        ? tabs[currentTab].getPeriod(getTime(selectedMission))
        : null;
      if (currentTab === "mission") {
        setSelectedPeriod(missionPeriod);
        setMissionId(mission);
      }
    }
  }, [location]);

  const [currentTab, setCurrentTab] = React.useState("mission");

  const groupedMissions = groupBy(missions, m =>
    tabs[currentTab].getPeriod(getTime(m))
  );

  const periods = Object.keys(groupedMissions)
    .map(p => parseInt(p))
    .sort();

  const filledPeriods = fillHistoryPeriods(periods, currentTab);

  const [selectedPeriod, setSelectedPeriod] = React.useState(
    filledPeriods[filledPeriods.length - 1]
  );
  const mission = missions.find(m => getTime(m) === selectedPeriod);
  const [missionId, setMissionId] = React.useState(mission ? mission.id : null);

  React.useEffect(() => {
    if (
      !groupedMissions[selectedPeriod] &&
      !filledPeriods.includes(selectedPeriod)
    ) {
      if (missionId && currentTab === "mission") {
        const mission = missions.find(m => m.id === missionId);
        if (mission)
          setSelectedPeriod(tabs[currentTab].getPeriod(getTime(mission)));
        else setSelectedPeriod(filledPeriods[filledPeriods.length - 1]);
      } else setSelectedPeriod(filledPeriods[filledPeriods.length - 1]);
    }
  }, [missions]);

  function handlePeriodChange(e, newTab, selectedDate) {
    const newGroups = groupBy(missions, m =>
      tabs[newTab].getPeriod(getTime(m))
    );

    const newPeriods = fillHistoryPeriods(
      Object.keys(newGroups)
        .map(p => parseInt(p))
        .sort(),
      newTab
    );

    const newPeriod = findMatchingPeriodInNewScale(
      selectedDate,
      newPeriods,
      tabs[currentTab].periodSize,
      tabs[newTab].periodSize
    );
    setCurrentTab(newTab);
    setSelectedPeriod(newPeriod);
    if (newTab === "mission") {
      const mission = missions.find(m => getTime(m) === newPeriod);
      setMissionId(mission ? mission.id : null);
    }
    resetLocation();
  }

  const resetLocation = () => {
    if (location.search) {
      history.push(location.pathname, location.state);
    }
  };

  const classes = useStyles();

  const missionsInSelectedPeriod = groupedMissions[selectedPeriod];
  let followingPeriodStart = periods.find(p => p > selectedPeriod);
  if (
    !followingPeriodStart &&
    currentMission &&
    !missions.find(m => m.id === currentMission.id)
  )
    followingPeriodStart = getTime(currentMission);

  const periodsWithNeedForValidation = mapValues(
    groupedMissions,
    ms => !ms[0].validation
  );
  const periodsWithNeedForAdminValidation = mapValues(
    groupedMissions,
    ms => !ms[0].adminValidation
  );

  return (
    <Paper className={classes.fullScreen}>
      <Container
        className="flex-column full-height"
        style={{ flexGrow: 1, flexShrink: 0 }}
        disableGutters
        maxWidth="sm"
      >
        <AccountButton p={2} onBackButtonClick={onBackButtonClick} />
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
          {filledPeriods.length > 0 && (
            <PeriodCarouselPicker
              periods={filledPeriods}
              shouldDisplayRedChipsForPeriods={
                currentTab === "mission" ? periodsWithNeedForValidation : null
              }
              shouldDisplayOrangeChipsForPeriods={
                currentTab === "mission"
                  ? periodsWithNeedForAdminValidation
                  : null
              }
              selectedPeriod={selectedPeriod}
              onPeriodChange={newp => {
                setSelectedPeriod(newp);
                if (currentTab === "mission") {
                  const mission = missions.find(m => getTime(m) === newp);
                  setMissionId(mission ? mission.id : null);
                }
                resetLocation();
              }}
              renderPeriod={tabs[currentTab].formatPeriod}
            />
          )}
        </Container>
        <Container
          className={`${classes.contentContainer} ${
            missionsInSelectedPeriod ? "" : classes.placeholderContainer
          }`}
          maxWidth={false}
        >
          {missionsInSelectedPeriod ? (
            tabs[currentTab].renderPeriod({
              missionsInPeriod: missionsInSelectedPeriod,
              handleMissionClick: date => e =>
                handlePeriodChange(e, "mission", date),
              followingPeriodStart,
              editActivityEvent,
              createActivity,
              editExpenditures,
              currentMission,
              validateMission,
              logComment,
              cancelComment
            })
          ) : (
            <Box className={classes.placeholder}>
              <NoDataImage height={100} />
              <Typography>
                Aucune mission enregistrée pour la période
              </Typography>
            </Box>
          )}
        </Container>
      </Container>
    </Paper>
  );
}
