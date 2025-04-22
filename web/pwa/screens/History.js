import moment from "moment";
import React, { useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";

import {
  useStoreSyncedWithLocalStorage,
  broadCastChannel
} from "common/store/store";
import { filterActivitiesOverlappingPeriod } from "common/utils/activities";
import { useApi } from "common/utils/api";
import { USER_MISSIONS_HISTORY_QUERY } from "common/utils/apiQueries";
import { useSelectPeriod } from "common/utils/history/changePeriod";
import { useComputePeriodStatuses } from "common/utils/history/computePeriodStatuses";
import { useGroupMissionsAndExtractActivities } from "common/utils/history/groupByPeriodUnit";
import { PERIOD_UNITS } from "common/utils/history/periodUnits";
import { NoDataImage } from "common/utils/icons";
import { useModals } from "common/utils/modals";
import {
  differenceInCalendarMonths,
  isThisMonth,
  startOfMonth,
  addMonths,
  subMonths,
  endOfDay,
  endOfMonth,
  isAfter,
  endOfToday
} from "date-fns";
import {
  DAY,
  WEEK,
  getStartOfWeek,
  endOfMonthAsDate,
  isoFormatLocalDate,
  jsToUnixTimestamp,
  shortPrettyFormatDay,
  SHORT_MONTHS,
  startOfDayAsDate,
  isMoreOrLessTheSameDay,
  formatCompleteDayOfWeek
} from "common/utils/time";
import { usePageTitle } from "../../common/UsePageTitle";

import { DEFAULT_MONTH_RANGE_HISTORY } from "common/utils/mission";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { AccountButton } from "../components/AccountButton";
import { Day } from "../components/history/Day";
import { Mission } from "../components/history/Mission";
import { Month } from "../components/history/Month";
import { Week } from "../components/history/Week";
import { PeriodCarouselPicker } from "../components/PeriodCarouselPicker";
import { PeriodFilter } from "../components/PeriodFilter";
import { syncMissions } from "common/utils/loadUserData";
import { useHolidays } from "../../common/useHolidays";
import { LogHolidayButton } from "../../common/LogHolidayButton";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { fr } from "@codegouvfr/react-dsfr";
import { getDayChip } from "../components/history/Chips";

const tabs = {
  mission: {
    label: "Mission",
    value: "mission",
    ...PERIOD_UNITS.mission,
    getTitle: (period, _) => shortPrettyFormatDay(period),
    getSubtitle: (_, missions) => {
      const mission = missions ? missions[0] : {};
      return mission.name || "Sans nom";
    },
    renderPeriod: ({ missionsInPeriod, ...props }) => (
      <Mission
        mission={missionsInPeriod[0]}
        collapsable={false}
        headingComponent="h2"
        {...props}
      />
    )
  },
  day: {
    label: "Jour",
    value: "day",
    getTitle: (period, _) => shortPrettyFormatDay(period),
    getSubtitle: (period, _) => formatCompleteDayOfWeek(period),
    renderChip: getDayChip,
    ...PERIOD_UNITS.day,
    renderPeriod: props => <Day headingComponent="h2" {...props} />
  },
  week: {
    label: "Semaine",
    value: "week",
    ...PERIOD_UNITS.week,
    getTitle: (period, _) => shortPrettyFormatDay(period),
    getSubtitle: (period, _) => `au ${shortPrettyFormatDay(period + DAY * 6)}`,
    renderPeriod: props => <Week headingComponent="h2" {...props} />
  },
  month: {
    label: "Mois",
    value: "month",
    ...PERIOD_UNITS.month,
    renderPeriod: props => <Month {...props} />,
    getTitle: (period, missions) => {
      const periodDate = new Date(period * 1000);
      return SHORT_MONTHS[periodDate.getMonth()];
    },
    getSubtitle: (period, missions) => {
      const periodDate = new Date(period * 1000);
      return periodDate.getFullYear();
    }
  }
};

const useStyles = makeStyles(theme => ({
  contentContainer: {
    flexGrow: 1,
    flexShrink: 0,
    textAlign: "center",
    paddingLeft: 0,
    paddingRight: 0
  },
  placeholderContainer: {
    backgroundColor: "inherit",
    color: fr.colors.decisions.text.mention.grey.default
  },
  periodSelector: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2)
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
  accessControlContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  tab: {
    textTransform: "none",
    fontSize: "1rem",
    lineHeight: "1.5rem",
    fontWeight: 400,
    opacity: 1,
    color: fr.colors.decisions.background.flat.grey.default,
    padding: theme.spacing(1),
    "&.Mui-selected": {
      color: fr.colors.decisions.background.flat.blueFrance.default,
      fontWeight: 500
    }
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
  isInControl = false,
  controlTime = null,
  historyStartDay = null,
  coworkers = null,
  vehicles = null,
  userId = null,
  createMission = null,
  openPeriod = null,
  controlId = null,
  regulationComputationsByDay = [],
  groupedAlerts = null
}) {
  const location = useLocation();
  const history = useHistory();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const classes = useStyles();
  const { openHolidaysModal, closeHolidaysModal } = useHolidays();
  usePageTitle("Historique - Mobilic");

  const actualUserId = userId || store.userId();
  const currentCompanies = store.companies();

  /* MANAGE DIRECT LINK & HISTORY */

  const queryString = new URLSearchParams(location.search);
  const [currentTab, setCurrentTab] = React.useState(
    queryString.get("mission") ? "mission" : "day"
  );

  React.useEffect(() => {
    closeHolidaysModal();
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

  const onBackButtonClick = location.state
    ? () => history.push(location.state.previousPagePath)
    : null;

  /* MANAGE FILTER PERIOD */

  const [startPeriodFilter, setStartPeriodFilter] = React.useState(
    historyStartDay
      ? startOfDayAsDate(new Date(historyStartDay))
      : startOfMonth(subMonths(new Date(), DEFAULT_MONTH_RANGE_HISTORY))
  );
  const [endPeriodFilter, setEndPeriodFilter] = React.useState(
    controlTime ? new Date(controlTime * 1000) : endOfToday()
  );
  const [periodFilterRangeError, setPeriodFilterRangeError] = React.useState(
    null
  );

  const onChangeStartPeriodFilter = async value => {
    const newStartPeriodFilter = startOfMonth(value);
    setStartPeriodFilter(newStartPeriodFilter);
    setPeriodFilterRangeError(null);

    const diffMonth = differenceInCalendarMonths(
      endPeriodFilter,
      newStartPeriodFilter
    );
    if (diffMonth > DEFAULT_MONTH_RANGE_HISTORY || diffMonth < 0) {
      let newEndPeriodFilter = endOfDay(
        endOfMonth(addMonths(newStartPeriodFilter, DEFAULT_MONTH_RANGE_HISTORY))
      );
      if (isAfter(newEndPeriodFilter, new Date())) {
        newEndPeriodFilter = endOfToday();
      }
      setEndPeriodFilter(newEndPeriodFilter);
      await syncMissionsStore(newStartPeriodFilter, newEndPeriodFilter);
    } else {
      await syncMissionsStore(newStartPeriodFilter, endPeriodFilter);
    }
  };

  const onChangeEndPeriodFilter = async value => {
    const newEndPeriodFilter = isThisMonth(value)
      ? value
      : endOfDay(endOfMonthAsDate(value));
    setEndPeriodFilter(newEndPeriodFilter);

    if (
      differenceInCalendarMonths(newEndPeriodFilter, startPeriodFilter) >
      DEFAULT_MONTH_RANGE_HISTORY
    ) {
      setPeriodFilterRangeError(
        `La période sélectionnée doit être inférieure à ${DEFAULT_MONTH_RANGE_HISTORY +
          1} mois !`
      ); // +1 because it's the default range + days from current month day.
    } else {
      setPeriodFilterRangeError(null);
      await syncMissionsStore(startPeriodFilter, newEndPeriodFilter);
    }
  };

  /* MANAGE MISSIONS */

  const syncMissionsStore = async (start, end) => {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlQuery(USER_MISSIONS_HISTORY_QUERY, {
        fromTime: jsToUnixTimestamp(start.getTime()),
        untilTime: jsToUnixTimestamp(end.getTime())
      });
      const resultMissions = apiResponse.data.me.missions.edges.map(
        e => e.node
      );
      await syncMissions(resultMissions, store, store.addToEntityObject);
      await broadCastChannel.postMessage("update");
    }, "missions-history");
  };

  const [
    missionGroupsByPeriodUnit,
    activities
  ] = useGroupMissionsAndExtractActivities(
    missions,
    startPeriodFilter,
    endPeriodFilter,
    periodFilterRangeError,
    Object.values(tabs)
  );

  /* MANAGE PERIOD FROM CAROUSSEL*/

  const [
    selectedPeriod,
    goToPeriod,
    goToMission,
    periodsByPeriodUnit
  ] = useSelectPeriod(
    missionGroupsByPeriodUnit,
    currentTab,
    startPeriodFilter,
    endPeriodFilter
  );
  const periodStatuses = useComputePeriodStatuses(missionGroupsByPeriodUnit);

  const groupedMissions = missionGroupsByPeriodUnit[currentTab] || {};
  const periods = periodsByPeriodUnit[currentTab] || [];

  const missionsInSelectedPeriod = groupedMissions[selectedPeriod];
  const selectedPeriodEnd = moment
    .unix(selectedPeriod)
    .add(tabs[currentTab].periodLength)
    .unix();

  function handlePeriodChange(e, newTab, selectedDate) {
    setCurrentTab(newTab);
    goToPeriod(newTab, selectedDate);
    resetLocation();
  }

  /* MANAGE REGULATION COMPUTATIONS */

  const regulationComputationsInPeriod = useMemo(() => {
    if (!selectedPeriod) {
      return [];
    }
    const periodElement = regulationComputationsByDay.find(
      item => item.day === isoFormatLocalDate(selectedPeriod)
    );
    return periodElement ? periodElement.regulationComputations : [];
  }, [selectedPeriod, regulationComputationsByDay]);

  const alertsInPeriod = React.useMemo(() => {
    if (!groupedAlerts) {
      return null;
    }
    if (currentTab === "day" || currentTab === "week") {
      return groupedAlerts.reduce((arr, curr) => {
        let { alerts, ...rest } = curr;
        alerts = alerts
          .filter(
            alert =>
              !!alert[currentTab] &&
              isMoreOrLessTheSameDay(alert[currentTab], selectedPeriod)
          )
          .map(alert => ({
            ...alert,
            ...rest
          }));
        return [...arr, ...alerts];
      }, []);
    }
    return null;
  }, [selectedPeriod, currentTab, groupedAlerts]);

  /* MANAGE MESSAGE WHEN NO DATA */

  const noDataMessage = currentTab => {
    if (currentTab === "day") {
      return "Journée non renseignée";
    }
    if (currentTab === "week") {
      return "Aucune journée renseignée dans la semaine";
    }
    return "Aucune journée renseignée dans le mois";
  };

  return (
    <Container
      className="flex-column"
      style={{ flexGrow: 1, flexShrink: 0 }}
      disableGutters
      maxWidth="md"
    >
      {!isInControl && (
        <>
          <AccountButton p={2} onBackButtonClick={onBackButtonClick} />
          <Box className={classes.accessControlContainer}>
            <Button
              priority="secondary"
              className={cx(classes.generateAccessButton, "error")}
              onClick={() => {
                modals.open("userReadQRCode");
              }}
            >
              Accès contrôleurs
            </Button>
          </Box>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            marginBottom={2}
          >
            <Grid container item direction="row" alignItems="center" sm={6}>
              {currentCompanies?.length > 0 && (
                <Button
                  priority="tertiary no outline"
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
                          const actualMissionId = store.identityMap()[
                            tempMissionId
                          ];
                          if (!actualMissionId) {
                            alerts.error(
                              "La mission n'a pas pu être créée. Vérifiez votre connexion internet, vous ne pouvez pas créer de mission passée sans être connecté.",
                              tempMissionId,
                              6000
                            );
                          } else {
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
                  iconId="fr-icon-add-circle-fill"
                  iconPosition="left"
                >
                  Ajouter une mission passée
                </Button>
              )}
            </Grid>
            <LogHolidayButton onClick={() => openHolidaysModal()} />
            <Grid
              container
              item
              direction="row"
              alignItems="center"
              justifyContent={{ sm: "flex-end" }}
              xs={12}
            >
              <Button
                priority="tertiary no outline"
                iconId="fr-icon-download-fill"
                iconPosition="left"
                onClick={() =>
                  modals.open("pdfExport", {
                    initialMinDate: startPeriodFilter,
                    initialMaxDate: endPeriodFilter
                  })
                }
              >
                Télécharger un relevé d'heures
              </Button>
            </Grid>
          </Grid>
          <PeriodFilter
            minDate={startPeriodFilter}
            setMinDate={onChangeStartPeriodFilter}
            maxDate={endPeriodFilter}
            setMaxDate={onChangeEndPeriodFilter}
            periodFilterRangeError={periodFilterRangeError}
          />
        </>
      )}
      <Container className={classes.periodSelector} maxWidth={false}>
        <Tabs
          value={currentTab}
          onChange={(e, tab) => handlePeriodChange(e, tab, selectedPeriod)}
          style={{ flexGrow: 1 }}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="inherit"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor:
                fr.colors.decisions.background.flat.blueFrance.default
            },
            marginBottom: 1
          }}
        >
          {Object.values(tabs).map((tabProps, index) => (
            <Tab
              key={index + 1}
              label={tabProps.label}
              value={tabProps.value}
              className={classes.tab}
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
            {...tabs[currentTab]}
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
            regulationComputationsInPeriod,
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
            userId: actualUserId,
            controlId: controlId,
            alertsInPeriod
          })
        ) : (
          <Box className={classes.placeholder}>
            <NoDataImage height={100} />
            <Typography>{noDataMessage(currentTab)}</Typography>
          </Box>
        )}
      </Container>
    </Container>
  );
}
