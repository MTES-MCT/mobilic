import React from "react";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
  getStartOfWeek,
  SHORT_MONTHS,
  shortPrettyFormatDay,
  DAY,
  WEEK
} from "common/utils/time";
import { useGroupMissionsAndExtractActivities } from "common/utils/history/groupByPeriodUnit";
import { makeStyles } from "@mui/styles";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import Typography from "@mui/material/Typography";
import { AccountButton } from "../components/AccountButton";
import { useLocation, useHistory } from "react-router-dom";
import Box from "@mui/material/Box";
import { NoDataImage } from "common/utils/icons";
import Button from "@mui/material/Button";
import { useModals } from "common/utils/modals";
import moment from "moment";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { Mission } from "../components/history/Mission";
import { Day } from "../components/history/Day";
import { Week } from "../components/history/Week";
import { Month } from "../components/history/Month";
import { filterActivitiesOverlappingPeriod } from "common/utils/activities";
import Grid from "@mui/material/Grid";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useSelectPeriod } from "common/utils/history/changePeriod";
import { PERIOD_UNITS } from "common/utils/history/periodUnits";
import { useComputePeriodStatuses } from "common/utils/history/computePeriodStatuses";

const tabs = {
  mission: {
    label: "Mission",
    value: "mission",
    ...PERIOD_UNITS.mission,
    formatPeriod: (period, missions) => {
      const mission = missions ? missions[0] : {};
      return (
        <Box className="flex-column-space-between">
          <Typography className="bold">{mission.name || "Sans nom"}</Typography>
          <Typography>{shortPrettyFormatDay(period)}</Typography>
        </Box>
      );
    },
    renderPeriod: ({ missionsInPeriod, ...props }) => (
      <Mission mission={missionsInPeriod[0]} collapsable={false} {...props} />
    )
  },
  day: {
    label: "Jour",
    value: "day",
    ...PERIOD_UNITS.day,
    renderPeriod: props => <Day {...props} />
  },
  week: {
    label: "Semaine",
    value: "week",
    ...PERIOD_UNITS.week,
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
    renderPeriod: props => <Week {...props} />
  },
  month: {
    label: "Mois",
    value: "month",
    ...PERIOD_UNITS.month,
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
  createMission = null,
  openPeriod = null
}) {
  const location = useLocation();
  const history = useHistory();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const actualUserId = userId || store.userId();

  const onBackButtonClick = location.state
    ? () => history.push(location.state.previousPagePath)
    : null;

  const queryString = new URLSearchParams(location.search);
  const [currentTab, setCurrentTab] = React.useState(
    queryString.get("mission") ? "mission" : "day"
  );

  const [
    missionGroupsByPeriodUnit,
    activities
  ] = useGroupMissionsAndExtractActivities(missions, Object.values(tabs));
  const [
    selectedPeriod,
    goToPeriod,
    goToMission,
    periodsByPeriodUnit
  ] = useSelectPeriod(missionGroupsByPeriodUnit, currentTab);
  const periodStatuses = useComputePeriodStatuses(missionGroupsByPeriodUnit);

  const groupedMissions = missionGroupsByPeriodUnit[currentTab] || {};
  const periods = periodsByPeriodUnit[currentTab] || [];

  function handlePeriodChange(e, newTab, selectedDate) {
    setCurrentTab(newTab);
    goToPeriod(newTab, selectedDate);
    resetLocation();
  }

  React.useEffect(() => {
    let params = openPeriod;
    if (!params) {
      const queryString = new URLSearchParams(location.search);
      params = {};
      for (let pair of queryString.entries()) {
        params[pair[0]] = pair[1];
      }
    }
    const periodUnit = Object.keys(params).find(unit =>
      Object.keys(PERIOD_UNITS).includes(unit)
    );
    if (periodUnit === "mission") {
      const missionId = parseInt(params[periodUnit]);
      if (missionId) {
        setCurrentTab("mission");
        goToMission(missionId);
      }
    } else if (periodUnit) {
      let ts = null;
      try {
        const date = new Date(
          parseInt(params[periodUnit].slice(0, 4)),
          parseInt(params[periodUnit].slice(5, 7)) - 1,
          parseInt(params[periodUnit].slice(8, 10))
        );
        ts = (date.getTime() / 1000) >> 0;
      } catch {
        ts = null;
      }
      if (ts) {
        setCurrentTab(periodUnit);
        goToPeriod(periodUnit, ts);
      }
    }
  }, [location, openPeriod]);

  const resetLocation = () => {
    if (location.search && location.pathname.startsWith("/app/history")) {
      history.push(location.pathname, location.state);
    }
  };

  const classes = useStyles();

  const missionsInSelectedPeriod = groupedMissions[selectedPeriod];
  const activitiesBefore = selectedPeriod
    ? activities.filter(a => a.startTime < selectedPeriod)
    : [];
  const previousPeriodActivityEnd =
    activitiesBefore.length > 0
      ? Math.min(
          selectedPeriod,
          Math.max(...activitiesBefore.map(a => a.endTime))
        )
      : null;

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
        <Grid
          container
          key={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Button
              aria-label="Accès contrôleur"
              className={classes.generateAccessButton}
              color="error"
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
          variant="fullWidth"
          indicatorColor="primary"
          textColor="inherit"
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
        {periods.length > 0 && (
          <PeriodCarouselPicker
            periods={periods}
            selectedPeriod={selectedPeriod}
            onPeriodChange={newp => {
              goToPeriod(currentTab, newp);
              resetLocation();
            }}
            periodStatuses={periodStatuses[currentTab] || {}}
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
            userId: actualUserId
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
