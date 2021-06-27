import React from "react";
import mapValues from "lodash/mapValues";
import Container from "@material-ui/core/Container";
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
  HOUR,
  getStartOfDay,
  formatTimer
} from "common/utils/time";
import {
  computePeriodStats,
  computeTimesAndDurationsFromActivities,
  renderMissionKpis,
  renderPeriodKpis,
  WorkTimeSummaryAdditionalInfo,
  WorkTimeSummaryKpiGrid
} from "../components/WorkTimeSummary";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import { getTime, sortEvents } from "common/utils/events";
import {
  findMatchingPeriodInNewUnit,
  groupMissionsByPeriodUnit
} from "common/utils/history";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import { RegulationCheck } from "../components/RegulationCheck";
import {
  checkMaximumDurationOfUninterruptedWork,
  checkMaximumDurationOfWork,
  checkMinimumDurationOfBreak,
  checkMinimumDurationOfDailyRest,
  checkMinimumDurationOfWeeklyRest,
  RULE_RESPECT_STATUS
} from "common/utils/regulation";
import { MissionReviewSection } from "../components/MissionReviewSection";
import Link from "@material-ui/core/Link";
import { MissionDetails } from "../components/MissionDetails";
import Typography from "@material-ui/core/Typography";
import { AccountButton } from "../components/AccountButton";
import { useLocation, useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { NoDataImage } from "common/utils/icons";
import Button from "@material-ui/core/Button";
import maxBy from "lodash/maxBy";
import { useModals } from "common/utils/modals";
import moment from "moment";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { ActivityList } from "../components/ActivityList";
import AddCircleIcon from "@material-ui/icons/AddCircle";

function ItalicWarningTypography(props) {
  const classes = useStyles();

  return <Typography className={classes.warningText} {...props} />;
}

function MissionSummary({
  mission,
  alternateDisplay = false,
  children,
  collapsable = false,
  defaultOpenCollapse = false,
  showMetrics = true
}) {
  const [open, setOpen] = React.useState(defaultOpenCollapse);
  const classes = useStyles();

  const kpis = computeTimesAndDurationsFromActivities(mission.activities);

  return (
    <>
      <WorkTimeSummaryAdditionalInfo
        disableTopMargin
        disableBottomMargin={false}
        className={alternateDisplay ? classes.darkCard : ""}
      >
        <Box style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography className="bold">
            {mission.name
              ? `Nom de la mission : ${mission.name}`
              : "Mission sans nom"}
          </Typography>
          {collapsable && (
            <IconButton
              aria-label={open ? "Masquer" : "Afficher"}
              color="inherit"
              className="no-margin-no-padding"
              onClick={() => setOpen(!open)}
            >
              {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </WorkTimeSummaryAdditionalInfo>
      <Collapse in={open || !collapsable}>
        {!mission.ended && (
          <WorkTimeSummaryAdditionalInfo
            disableTopMargin
            disableBottomMargin={false}
            {...(alternateDisplay
              ? { elevation: 0, className: classes.alternateCard }
              : {})}
          >
            <ItalicWarningTypography>
              Mission en cours !
            </ItalicWarningTypography>
          </WorkTimeSummaryAdditionalInfo>
        )}
        {showMetrics && (
          <WorkTimeSummaryKpiGrid
            metrics={renderMissionKpis(kpis, "Durée", true)}
            cardProps={
              alternateDisplay
                ? { elevation: 0, className: classes.alternateCard }
                : {}
            }
          />
        )}
        {children}
      </Collapse>
    </>
  );
}

const tabs = {
  mission: {
    label: "Mission",
    value: "mission",
    periodLength: moment.duration(0),
    getPeriod: date => date,
    formatPeriod: (period, missions) => {
      const mission = missions[0];
      return (
        <Box className="flex-column-space-between">
          <Typography className="bold">{mission.name || "Sans nom"}</Typography>
          <Typography>{shortPrettyFormatDay(period)}</Typography>
        </Box>
      );
    },
    renderPeriod: ({
      missionsInPeriod,
      editActivityEvent,
      createActivity,
      editExpenditures,
      currentMission,
      validateMission,
      logComment,
      cancelComment,
      coworkers,
      registerKilometerReading,
      vehicles,
      userId
    }) => {
      const mission = missionsInPeriod[0];
      return (
        <div>
          <MissionSummary mission={mission}>
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
                hideValidations={!mission.ended}
                validateMission={validateMission}
                validationButtonName="Valider"
                logComment={logComment}
                cancelComment={cancelComment}
                coworkers={coworkers}
                vehicles={vehicles}
                userId={userId}
                editKilometerReading={
                  mission.adminValidation ? null : registerKilometerReading
                }
              />
            </WorkTimeSummaryAdditionalInfo>
          </MissionSummary>
        </div>
      );
    }
  },
  day: {
    label: "Jour",
    value: "day",
    periodLength: moment.duration(1, "days"),
    getPeriod: date => getStartOfDay(date),
    renderPeriod: ({
      missionsInPeriod,
      selectedPeriodStart,
      selectedPeriodEnd,
      previousPeriodActivityEnd,
      editActivityEvent,
      createActivity,
      editExpenditures,
      currentMission,
      validateMission,
      logComment,
      cancelComment,
      registerKilometerReading,
      coworkers,
      vehicles,
      userId,
      weekMissions
    }) => {
      const lastMission = missionsInPeriod[missionsInPeriod.length - 1];

      const stats = computePeriodStats(
        missionsInPeriod,
        selectedPeriodStart,
        selectedPeriodEnd
      );

      let weekStats = null;
      let checkNumberOfWorkedDaysInWeek = null;
      if (new Date(selectedPeriodStart * 1000).getDay() === 0) {
        const weekStart = getStartOfWeek(selectedPeriodStart);
        weekStats = computePeriodStats(
          weekMissions,
          weekStart,
          weekStart + WEEK
        );
        checkNumberOfWorkedDaysInWeek = checkMinimumDurationOfWeeklyRest(
          weekStats.workedDays,
          weekStats.innerLongBreaks,
          weekStats.startTime,
          null
        );
      }

      const innerLongBreak = stats.innerLongBreaks
        ? stats.innerLongBreaks[0]
        : null;

      const checkBreakRespect = lastMission.ended
        ? maxBy(
            stats.groupedActivities.map(acts =>
              checkMinimumDurationOfBreak(acts)
            ),
            r => r.status
          )
        : null;

      return (
        <div>
          <WorkTimeSummaryKpiGrid
            metrics={renderPeriodKpis(stats, true).filter(
              m => m.name !== "workedDays"
            )}
          />
          <WorkTimeSummaryAdditionalInfo>
            {lastMission.ended ? (
              <>
                <RegulationCheck
                  key={0}
                  check={
                    innerLongBreak
                      ? {
                          status: RULE_RESPECT_STATUS.success,
                          message: `Repos journalier respecté (${formatTimer(
                            innerLongBreak.duration
                          )}) !`
                        }
                      : checkMinimumDurationOfDailyRest(
                          stats.startTime,
                          previousPeriodActivityEnd
                        )
                  }
                />
                <RegulationCheck
                  key={2}
                  check={maxBy(
                    stats.groupedActivities.map(acts =>
                      checkMaximumDurationOfWork(acts)
                    ),
                    r => r.status
                  )}
                />
                <RegulationCheck key={3} check={checkBreakRespect} />

                <RegulationCheck
                  key={4}
                  check={
                    checkBreakRespect.status === RULE_RESPECT_STATUS.failure
                      ? {
                          status: RULE_RESPECT_STATUS.failure,
                          message: `Travail ininterrompu pendant plus de 6 heures !`
                        }
                      : checkMaximumDurationOfUninterruptedWork(
                          stats.filteredActivities
                        )
                  }
                />
                {weekStats &&
                  checkNumberOfWorkedDaysInWeek.status ===
                    RULE_RESPECT_STATUS.failure && (
                    <RegulationCheck
                      key={5}
                      check={checkNumberOfWorkedDaysInWeek}
                    />
                  )}
              </>
            ) : (
              <ItalicWarningTypography>
                Mission en cours !
              </ItalicWarningTypography>
            )}
          </WorkTimeSummaryAdditionalInfo>
          <WorkTimeSummaryAdditionalInfo>
            <MissionReviewSection
              title="Activités de la journée"
              className="no-margin-no-padding"
            >
              <ActivityList
                activities={stats.filteredActivities}
                fromTime={selectedPeriodStart}
                untilTime={selectedPeriodEnd}
                isMissionEnded={lastMission.ended}
              />
            </MissionReviewSection>
          </WorkTimeSummaryAdditionalInfo>
          <WorkTimeSummaryAdditionalInfo>
            <MissionReviewSection
              title="Détail par mission"
              className="no-margin-no-padding"
            >
              <List>
                {missionsInPeriod.map(mission => (
                  <ListItem
                    key={mission.id}
                    style={{
                      display: "block",
                      paddingLeft: 0,
                      paddingRight: 0
                    }}
                  >
                    <MissionSummary
                      mission={mission}
                      alternateDisplay
                      collapsable
                      defaultOpenCollapse={missionsInPeriod.length === 1}
                      showMetrics={false}
                    >
                      <MissionDetails
                        inverseColors
                        mission={mission}
                        editActivityEvent={
                          mission.adminValidation ? null : editActivityEvent
                        }
                        createActivity={
                          mission.adminValidation ? null : createActivity
                        }
                        editExpenditures={
                          mission.adminValidation ? null : editExpenditures
                        }
                        nullableEndTimeInEditActivity={
                          currentMission
                            ? mission.id === currentMission.id
                            : true
                        }
                        hideValidations={!mission.ended}
                        validateMission={validateMission}
                        validationButtonName="Valider"
                        logComment={logComment}
                        cancelComment={cancelComment}
                        coworkers={coworkers}
                        vehicles={vehicles}
                        userId={userId}
                        fromTime={selectedPeriodStart}
                        untilTime={selectedPeriodEnd}
                        editKilometerReading={
                          mission.adminValidation
                            ? null
                            : registerKilometerReading
                        }
                      />
                    </MissionSummary>
                  </ListItem>
                ))}
              </List>
            </MissionReviewSection>
          </WorkTimeSummaryAdditionalInfo>
        </div>
      );
    }
  },
  week: {
    label: "Semaine",
    value: "week",
    periodLength: moment.duration(1, "weeks"),
    formatPeriod: (period, missions) => {
      return (
        <Box className="flex-column-space-between">
          <Typography className={missions ? "bold" : ""}>
            {shortPrettyFormatDay(period)}
          </Typography>
          <Typography
            className={missions ? "bold" : ""}
            style={{ lineHeight: 0 }}
          >
            -
          </Typography>
          <Typography className={missions ? "bold" : ""}>
            {shortPrettyFormatDay(period + DAY * 7)}
          </Typography>
        </Box>
      );
    },
    getPeriod: date => getStartOfWeek(date),
    renderPeriod: ({
      missionsInPeriod,
      selectedPeriodStart,
      selectedPeriodEnd,
      handleMissionClick,
      previousPeriodActivityEnd
    }) => {
      const stats = computePeriodStats(
        missionsInPeriod,
        selectedPeriodStart,
        selectedPeriodEnd
      );
      return (
        <div>
          <WorkTimeSummaryKpiGrid
            metrics={renderPeriodKpis(stats).filter(m => m.name !== "service")}
          />
          <WorkTimeSummaryAdditionalInfo>
            <RegulationCheck
              check={checkMinimumDurationOfWeeklyRest(
                stats.workedDays,
                stats.innerLongBreaks,
                stats.startTime,
                previousPeriodActivityEnd
              )}
            />
          </WorkTimeSummaryAdditionalInfo>
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
      );
    }
  },
  month: {
    label: "Mois",
    value: "month",
    periodLength: moment.duration(1, "months"),
    getPeriod: date => getStartOfMonth(date),
    renderPeriod: ({
      missionsInPeriod,
      selectedPeriodStart,
      selectedPeriodEnd
    }) => (
      <div>
        <WorkTimeSummaryKpiGrid
          metrics={renderPeriodKpis(
            computePeriodStats(
              missionsInPeriod,
              selectedPeriodStart,
              selectedPeriodEnd
            )
          ).filter(m => m.name !== "service")}
        />
      </div>
    ),
    formatPeriod: (period, missions) => {
      const periodDate = new Date(period * 1000);
      return (
        <Box className="flex-column-space-between">
          <Typography
            variant="h5"
            style={{ fontWeight: missions ? "bold" : "normal" }}
          >
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
    textAlign: "center",
    paddingBottom: theme.spacing(4)
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
  whiteFullScreen: {
    width: "100%",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper
  },
  placeholder: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  generateAccessButton: {
    margin: theme.spacing(2),
    alignSelf: "flex-start"
  },
  alternateCard: {
    backgroundColor: theme.palette.background.default
  },
  darkCard: {
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.primary.contrastText
  },
  warningText: {
    fontStyle: "italic",
    color: theme.palette.warning.main
  },
  addMissionContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  addMissionButton: {
    paddingLeft: 0,
    marginLeft: 0
  }
}));

function fillHistoryPeriods(periods, step) {
  if (!["day", "month", "week"].includes(step)) return periods;

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
      if (step === "day") {
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

function computeMissionGroups(missions, periodUnits) {
  const groupsByPeriodUnit = {};
  periodUnits.forEach(unit => {
    groupsByPeriodUnit[unit.value] = groupMissionsByPeriodUnit(
      missions,
      unit.getPeriod,
      unit.periodLength
    );
  });
  return groupsByPeriodUnit;
}

export function History({
  missions = [],
  currentMission,
  editActivityEvent,
  createActivity,
  editExpenditures,
  validateMission,
  logComment,
  cancelComment,
  displayActions = true,
  coworkers = null,
  vehicles = null,
  userId = null
}) {
  const location = useLocation();
  const history = useHistory();
  const modals = useModals();

  const [activities, setActivities] = React.useState([]);
  const [
    missionGroupsByPeriodUnit,
    setMissionGroupsByPeriodUnit
  ] = React.useState(computeMissionGroups(missions, Object.values(tabs)));

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

  const queryString = new URLSearchParams(location.search);
  const [currentTab, setCurrentTab] = React.useState(
    queryString.get("mission") ? "mission" : "day"
  );

  const groupedMissions = missionGroupsByPeriodUnit[currentTab];

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

  React.useEffect(() => {
    setMissionGroupsByPeriodUnit(
      computeMissionGroups(missions, Object.values(tabs))
    );
    const acts = missions.reduce(
      (acc, mission) => [...acc, ...mission.activities],
      []
    );
    sortEvents(acts);
    setActivities(acts);
  }, [missions]);

  const missionsGroupedByWeek = missionGroupsByPeriodUnit["week"];
  const weekPeriod = findMatchingPeriodInNewUnit(
    selectedPeriod,
    Object.keys(missionsGroupedByWeek),
    tabs[currentTab].periodLength,
    tabs.week.periodLength
  );
  const weekMissions = missionsGroupedByWeek[weekPeriod];

  function handlePeriodChange(e, newTab, selectedDate) {
    const newGroups = missionGroupsByPeriodUnit[newTab];

    const newPeriods = fillHistoryPeriods(
      Object.keys(newGroups)
        .map(p => parseInt(p))
        .sort(),
      newTab
    );

    const newPeriod = findMatchingPeriodInNewUnit(
      selectedDate,
      newPeriods,
      tabs[currentTab].periodLength,
      tabs[newTab].periodLength
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
    if (location.search && location.pathname.startsWith("/app/history")) {
      history.push(location.pathname, location.state);
    }
  };

  const classes = useStyles();

  const missionsInSelectedPeriod = groupedMissions[selectedPeriod];
  const activitiesBefore = activities.filter(a => a.startTime < selectedPeriod);
  const previousPeriodActivityEnd =
    activitiesBefore.length > 0
      ? Math.min(
          selectedPeriod,
          Math.max(...activitiesBefore.map(a => a.endTime))
        )
      : null;

  const periodsWithNeedForValidation = mapValues(groupedMissions, ms =>
    ms.some(m => !m.validation && !m.adminValidation)
  );
  const periodsWithNeedForAdminValidation = mapValues(groupedMissions, ms =>
    ms.some(m => !m.adminValidation)
  );

  const shouldDisplayPeriodsInBold = mapValues(groupedMissions, () => true);

  return (
    <Container
      className={classes.whiteFullScreen}
      maxWidth={false}
      disableGutters
    >
      <Container
        className="flex-column full-height"
        style={{ flexGrow: 1, flexShrink: 0 }}
        disableGutters
        maxWidth="sm"
      >
        {displayActions && [
          <AccountButton p={2} key={1} onBackButtonClick={onBackButtonClick} />,
          <Button
            key={2}
            aria-label="Accès contrôleur"
            className={classes.generateAccessButton}
            color="secondary"
            variant="outlined"
            onClick={() => {
              modals.open("userReadQRCode");
            }}
          >
            Donner accès à l'historique
          </Button>,
          <Box key={3} className={classes.addMissionContainer}>
            <IconButton color="primary">
              <AddCircleIcon fontSize="large" />
            </IconButton>
            <Typography align="left">Ajouter une mission passée</Typography>
          </Box>
        ]}
        <Container className={classes.periodSelector} maxWidth={false}>
          <Tabs
            value={currentTab}
            onChange={(e, tab) => handlePeriodChange(e, tab, selectedPeriod)}
            style={{ flexGrow: 1 }}
            variant="fullWdith"
          >
            {Object.values(tabs).map((tabProps, index) => (
              <Tab
                key={index + 1}
                label={tabProps.label}
                value={tabProps.value}
                style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}
              />
            ))}
          </Tabs>
          {filledPeriods.length > 0 && (
            <PeriodCarouselPicker
              periods={filledPeriods}
              shouldDisplayPeriodsInBold={shouldDisplayPeriodsInBold}
              shouldDisplayRedChipsForPeriods={
                ["mission", "day"].includes(currentTab)
                  ? periodsWithNeedForValidation
                  : null
              }
              shouldDisplayOrangeChipsForPeriods={
                ["mission", "day"].includes(currentTab)
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
              periodMissionsGetter={period => groupedMissions[period]}
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
              selectedPeriodStart: selectedPeriod,
              selectedPeriodEnd: moment
                .unix(selectedPeriod)
                .add(tabs[currentTab].periodLength)
                .unix(),
              missionsInPeriod: missionsInSelectedPeriod,
              handleMissionClick: date => e =>
                handlePeriodChange(e, "mission", date),
              weekMissions,
              previousPeriodActivityEnd,
              editActivityEvent,
              createActivity,
              editExpenditures,
              currentMission,
              validateMission,
              logComment,
              cancelComment,
              coworkers,
              vehicles,
              userId
            })
          ) : (
            <Box className={classes.placeholder}>
              <NoDataImage height={100} />
              <Typography>
                {currentTab === "day"
                  ? "Journée non travaillée"
                  : currentTab === "week"
                  ? "Aucune journée travaillée dans la semaine"
                  : "Aucune journée travaillée dans le mois"}
              </Typography>
            </Box>
          )}
        </Container>
      </Container>
    </Container>
  );
}
