import React from "react";
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
  HOUR,
  getStartOfDay
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
import {
  findMatchingPeriodInNewScale,
  groupMissionsByPeriod
} from "common/utils/history";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import { RegulationCheck } from "../components/RegulationCheck";
import { checkDayRestRespect } from "common/utils/regulation";
import { MissionReviewSection } from "../components/MissionReviewSection";
import Link from "@material-ui/core/Link";
import { MissionDetails } from "../components/MissionDetails";
import Typography from "@material-ui/core/Typography";
import { AccountButton } from "../components/AccountButton";
import { useLocation, useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { NoDataImage } from "common/utils/icons";
import Button from "@material-ui/core/Button";
import { useModals } from "common/utils/modals";
import moment from "moment";
import Collapse from "@material-ui/core/Collapse";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

function MissionSummary({
  mission,
  fromTime = null,
  untilTime = null,
  alternateDisplay = false,
  children,
  collapsable = false,
  defaultOpenCollapse = false
}) {
  const [open, setOpen] = React.useState(defaultOpenCollapse);
  const classes = useStyles();

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
        <WorkTimeSummaryKpiGrid
          metrics={computeMissionKpis(mission, fromTime, untilTime)}
          cardProps={
            alternateDisplay
              ? { elevation: 0, className: classes.alternateCard }
              : {}
          }
        />
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
                validateMission={validateMission}
                validationButtonName="Valider"
                logComment={logComment}
                cancelComment={cancelComment}
                coworkers={coworkers}
                vehicles={vehicles}
                userId={userId}
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
      followingMissionStart,
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
    }) => {
      const lastMission = missionsInPeriod[missionsInPeriod.length - 1];
      const lastMissionEnd =
        lastMission.activities[lastMission.activities.length - 1].endTime;
      return (
        <div>
          <WorkTimeSummaryKpiGrid
            metrics={computePeriodKpis(
              missionsInPeriod,
              selectedPeriodStart,
              selectedPeriodEnd
            ).filter(m => m.name !== "workedDays")}
          />
          <WorkTimeSummaryAdditionalInfo>
            <RegulationCheck
              check={checkDayRestRespect(lastMissionEnd, followingMissionStart)}
            />
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
                      fromTime={selectedPeriodStart}
                      untilTime={selectedPeriodEnd}
                      alternateDisplay
                      collapsable
                      defaultOpenCollapse={missionsInPeriod.length === 1}
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
                        validateMission={validateMission}
                        validationButtonName="Valider"
                        logComment={logComment}
                        cancelComment={cancelComment}
                        coworkers={coworkers}
                        vehicles={vehicles}
                        userId={userId}
                        fromTime={selectedPeriodStart}
                        untilTime={selectedPeriodEnd}
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
    renderPeriod: ({
      missionsInPeriod,
      selectedPeriodStart,
      selectedPeriodEnd,
      handleMissionClick
    }) => (
      <div>
        <WorkTimeSummaryKpiGrid
          metrics={computePeriodKpis(
            missionsInPeriod,
            selectedPeriodStart,
            selectedPeriodEnd
          ).filter(m => m.name !== "service")}
        />
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
    periodLength: moment.duration(1, "months"),
    getPeriod: date => getStartOfMonth(date),
    renderPeriod: ({
      missionsInPeriod,
      selectedPeriodStart,
      selectedPeriodEnd
    }) => (
      <div>
        <WorkTimeSummaryKpiGrid
          metrics={computePeriodKpis(
            missionsInPeriod,
            selectedPeriodStart,
            selectedPeriodEnd
          ).filter(m => m.name !== "service")}
        />
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

export function History({
  missions = [],
  currentMission,
  editActivityEvent,
  createActivity,
  editExpenditures,
  validateMission,
  logComment,
  cancelComment,
  displayAccountButton = true,
  displayQRCodeGeneration = true,
  coworkers = null,
  vehicles = null,
  userId = null
}) {
  const location = useLocation();
  const history = useHistory();
  const modals = useModals();

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

  const groupedMissions = groupMissionsByPeriod(
    missions,
    tabs[currentTab].getPeriod,
    tabs[currentTab].periodLength
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
    const newGroups = groupMissionsByPeriod(
      missions,
      tabs[newTab].getPeriod,
      tabs[newTab].periodLength
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
    if (location.search) {
      history.push(location.pathname, location.state);
    }
  };

  const classes = useStyles();

  const missionsInSelectedPeriod = groupedMissions[selectedPeriod];
  const followingPeriodStart = periods.find(p => p > selectedPeriod);

  let followingMissionStart;
  if (currentTab === "mission") {
    followingMissionStart = followingPeriodStart;
    if (
      !followingMissionStart &&
      currentMission &&
      !missions.find(m => m.id === currentMission.id)
    )
      followingMissionStart = getTime(currentMission);
  } else {
    if (followingPeriodStart) {
      followingMissionStart = getTime(groupedMissions[followingPeriodStart][0]);
    }
  }

  if (
    !followingMissionStart &&
    currentTab === "mission" &&
    currentMission &&
    !missions.find(m => m.id === currentMission.id)
  )
    followingMissionStart = getTime(currentMission);

  const periodsWithNeedForValidation = mapValues(groupedMissions, ms =>
    ms.some(m => !m.validation)
  );
  const periodsWithNeedForAdminValidation = mapValues(groupedMissions, ms =>
    ms.some(m => !m.adminValidation)
  );

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
        {displayAccountButton && (
          <AccountButton p={2} onBackButtonClick={onBackButtonClick} />
        )}
        {displayQRCodeGeneration && (
          <Button
            className={classes.generateAccessButton}
            color="secondary"
            variant="outlined"
            onClick={() => {
              modals.open("userReadQRCode");
            }}
          >
            Donner accès à l'historique
          </Button>
        )}
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
              followingMissionStart,
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
