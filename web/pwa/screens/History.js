import React from "react";
import mapValues from "lodash/mapValues";
import Container from "@material-ui/core/Container";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  getStartOfWeek,
  getStartOfMonth,
  SHORT_MONTHS,
  shortPrettyFormatDay,
  DAY,
  startOfDay,
  WEEK,
  HOUR,
  getStartOfDay
} from "common/utils/time";
import { sortEvents } from "common/utils/events";
import {
  findMatchingPeriodInNewUnit,
  groupMissionsByPeriodUnit
} from "common/utils/history";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import Typography from "@material-ui/core/Typography";
import { AccountButton } from "../components/AccountButton";
import { useLocation, useHistory } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { NoDataImage } from "common/utils/icons";
import Button from "@material-ui/core/Button";
import { useModals } from "common/utils/modals";
import moment from "moment";
import IconButton from "@material-ui/core/IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { Mission } from "../components/history/Mission";
import { Day } from "../components/history/Day";
import { Week } from "../components/history/Week";
import { Month } from "../components/history/Month";
import { filterActivitiesOverlappingPeriod } from "common/utils/activities";
import Grid from "@material-ui/core/Grid";
import GetAppIcon from "@material-ui/icons/GetApp";

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
    renderPeriod: ({ missionsInPeriod, ...props }) => (
      <Mission mission={missionsInPeriod[0]} {...props} />
    )
  },
  day: {
    label: "Jour",
    value: "day",
    periodLength: moment.duration(1, "days"),
    getPeriod: date => getStartOfDay(date),
    renderPeriod: props => <Day {...props} />
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
    renderPeriod: props => <Week {...props} />
  },
  month: {
    label: "Mois",
    value: "month",
    periodLength: moment.duration(1, "months"),
    getPeriod: date => getStartOfMonth(date),
    renderPeriod: props => <Month {...props} />,
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
  editVehicle,
  displayActions = true,
  coworkers = null,
  vehicles = null,
  userId = null,
  createMission = null
}) {
  const location = useLocation();
  const history = useHistory();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const alerts = useSnackbarAlerts();

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
        ? tabs[currentTab].getPeriod(selectedMission.startTime)
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
  const mission = missions.find(m => m.startTime === selectedPeriod);
  const [missionId, setMissionId] = React.useState(mission ? mission.id : null);

  React.useEffect(() => {
    if (
      !groupedMissions[selectedPeriod] &&
      !filledPeriods.includes(selectedPeriod)
    ) {
      if (missionId && currentTab === "mission") {
        const mission = missions.find(m => m.id === missionId);
        if (mission)
          setSelectedPeriod(tabs[currentTab].getPeriod(mission.startTime));
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
      const mission = missions.find(m => m.startTime === newPeriod);
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

  const selectedPeriodEnd = moment
    .unix(selectedPeriod)
    .add(tabs[currentTab].periodLength)
    .unix();

  return (
    <Container
      className="flex-column"
      style={{ flexGrow: 1, flexShrink: 0 }}
      disableGutters
      maxWidth="md"
    >
      {displayActions && [
        <AccountButton p={2} key={1} onBackButtonClick={onBackButtonClick} />,
        <Grid container key={2} justify="space-between" alignItems="center">
          <Grid item>
            <Button
              aria-label="Accès contrôleur"
              className={classes.generateAccessButton}
              color="secondary"
              variant="outlined"
              onClick={() => {
                modals.open("userReadQRCode");
              }}
            >
              Accès contrôleurs
            </Button>
          </Grid>
          <Grid item>
            <IconButton
              color="primary"
              onClick={() => modals.open("pdfExport")}
            >
              <GetAppIcon fontSize="large" />
            </IconButton>
          </Grid>
        </Grid>,
        <Box key={3} className={classes.addMissionContainer}>
          <IconButton
            color="primary"
            onClick={() =>
              modals.open("newMission", {
                companies: store.companies(),
                companyAddresses: store.getEntity("knownAddresses"),
                disableCurrentPosition: true,
                disableKilometerReading: true,
                withDay: true,
                withEndLocation: true,
                handleContinue: async missionInfos => {
                  await alerts.withApiErrorHandling(async () => {
                    const tempMissionId = await createMission({
                      companyId: missionInfos.company.id,
                      name: missionInfos.mission,
                      vehicle: missionInfos.vehicle,
                      startLocation: missionInfos.address,
                      endLocation: missionInfos.endAddress
                    });
                    await api.executePendingRequests();
                    const actualMissionId = store.identityMap()[tempMissionId];
                    if (!actualMissionId)
                      alerts.error(
                        "La mission n'a pas pu être créée",
                        tempMissionId,
                        6000
                      );
                    else {
                      history.push(
                        `/app/edit_mission?mission=${actualMissionId}`,
                        { day: missionInfos.day }
                      );
                      modals.close("newMission");
                    }
                  }, "create-mission");
                }
              })
            }
          >
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
                const mission = missions.find(m => m.startTime === newp);
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
            selectedPeriodEnd,
            missionsInPeriod: missionsInSelectedPeriod,
            activitiesWithNextAndPreviousDay: filterActivitiesOverlappingPeriod(
              activities,
              selectedPeriod - DAY,
              selectedPeriodEnd + DAY
            ),
            handleMissionClick: date => e =>
              handlePeriodChange(e, "mission", date),
            weekActivities: filterActivitiesOverlappingPeriod(
              activities,
              getStartOfWeek(selectedPeriod) - DAY,
              getStartOfWeek(selectedPeriod) + WEEK + DAY
            ),
            previousPeriodActivityEnd,
            editActivityEvent,
            createActivity,
            editExpenditures,
            currentMission,
            editVehicle,
            validateMission,
            logComment,
            cancelComment,
            activities,
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
  );
}
