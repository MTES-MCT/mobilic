import React from "react";
import debounce from "lodash/debounce";
import { useHistory } from "react-router-dom";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Paper from "@mui/material/Paper";
import { addDays } from "date-fns";
import { PeriodToggle } from "../components/PeriodToggle";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { WorkTimeTable } from "../components/WorkTimeTable";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import { useAdminStore, useAdminCompanies } from "../store/store";
import { useModals } from "common/utils/modals";
import {
  getEndOfDay,
  isoFormatLocalDate,
  startOfDay,
  startOfDayAsDate
} from "common/utils/time";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import SvgIcon from "@mui/material/SvgIcon";
import { ReactComponent as ExcelIcon } from "common/assets/images/excel.svg";
import { ReactComponent as TachoIcon } from "common/assets/images/tacho.svg";
import { LoadingButton } from "common/components/LoadingButton";
import Drawer from "@mui/material/Drawer";
import NewMissionForm from "../../common/NewMissionForm";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ACTIVITY_FILTER_EMPLOYEE,
  ACTIVITY_FILTER_MAX_DATE,
  ACTIVITY_FILTER_MIN_DATE,
  ADMIN_ADD_HOLIDAY,
  ADMIN_ADD_MISSION,
  ADMIN_EXPORT_C1B,
  ADMIN_EXPORT_EXCEL
} from "common/utils/matomoTags";
import { TeamFilter } from "../components/TeamFilter";
import {
  getUsersToSelectFromTeamSelection,
  unselectAndGetAllTeams
} from "../store/reducers/team";
import { LogHolidayButton } from "../../common/LogHolidayButton";
import { LogHolidayForm } from "../../common/LogHolidayForm";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import { usePageTitle } from "../../common/UsePageTitle";
import { useGetUsersSinceDate } from "../../common/hooks/useGetUsersSinceDate";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import CloseButton from "../../common/CloseButton";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { ADMIN_WORK_DAYS_QUERY } from "common/utils/apiQueries/admin";
import {
  buildLogLocationPayloadFromAddress,
  CREATE_MISSION_MUTATION,
  LOG_HOLIDAY_MUTATION,
  LOG_LOCATION_MUTATION
} from "common/utils/apiQueries/missions";
import { InactiveEmployeesDropdown } from "../components/InactiveEmployeesDropdown";
import { missionWithStats } from "../selectors/missionSelectors";

const useStyles = makeStyles((theme) => ({
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1)
  },
  pageHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2)
  },
  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: 0,
    lineHeight: "2.5rem"
  },
  filterGrid: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    flexShrink: 0
  },
  tableTitle: {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2)
  },
  container: {
    height: "100%",
    flexGrow: 1,
    border: "none"
  },
  workTimeTable: {
    overflowY: "hidden",
    flexGrow: 1,
    paddingTop: theme.spacing(1),
    "& .ReactVirtualized__Table__headerRow": {
      backgroundColor: fr.colors.decisions.background.contrastRaised.grey.default,
      borderTop: "none",
      borderBottom: `2px solid ${fr.colors.decisions.border.plain.grey.default}`
    }
  },
  workTimeTableContainer: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1)
  },
  missionTitle: {
    marginRight: theme.spacing(4)
  },
  missionTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
}));

const refreshWorkDays = async (
  setLoading,
  alerts,
  api,
  userId,
  minDate,
  maxDate,
  companyId,
  addWorkDays,
  addUsers
) => {
  setLoading(true);
  await alerts.withApiErrorHandling(async () => {
    // Use inclusive day boundaries and cap to 1 year.
    const minMissionTimestamp = startOfDay(new Date(minDate));
    const selectedMaxMissionTimestamp = getEndOfDay(
      startOfDay(new Date(maxDate))
    );
    const maxMissionTimestamp = Math.min(
      selectedMaxMissionTimestamp,
      minMissionTimestamp + (365 * 24 * 60 * 60) - 1
    );

    const companiesPayload = await api.graphQlQuery(ADMIN_WORK_DAYS_QUERY, {
      id: userId,
      activityAfter: minDate,
      activityBefore: maxDate,
      endedMissionsAfter: minMissionTimestamp,
      endedMissionsBefore: maxMissionTimestamp,
      companyIds: [companyId]
    });
    addWorkDays(companiesPayload.data.user.adminedCompanies, minDate);
    addUsers(companiesPayload.data.user.adminedCompanies);
  }, "load-work-days");
  setLoading(false);
};

const onMinDateChange = debounce(
  async (
    newMinDate,
    maxDate,
    userId,
    companyId,
    setLoading,
    addWorkDays,
    addUsers,
    api,
    alerts
  ) => {
    if (newMinDate < maxDate) {
      await refreshWorkDays(
        setLoading,
        alerts,
        api,
        userId,
        newMinDate,
        maxDate,
        companyId,
        addWorkDays,
        addUsers
      );
    }
  },
  500
);

const renderPickersDay = (pickersDayProps) => {
  const { key, ...safeProps } = pickersDayProps;
  return <PickersDay {...safeProps} />;
};

function ActivitiesPanel() {
  usePageTitle("Activités - Mobilic");
  const adminStore = useAdminStore();
  const [adminCompanies, company] = useAdminCompanies();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const history = useHistory();
  const { trackEvent } = useMatomo();
  const { getUsersSinceDate } = useGetUsersSinceDate();

  const [users, setUsers] = React.useState(adminStore.activitiesFilters.users);
  const [teams, setTeams] = React.useState(adminStore.activitiesFilters.teams);
  const [companies, setCompanies] = React.useState([]);
  const [minDate, setMinDate] = React.useState(
    adminStore.activitiesFilters.minDate
  );
  const [maxDate, setMaxDate] = React.useState(
    adminStore.activitiesFilters.maxDate
  );
  const [loading, setLoading] = React.useState(false);
  const [period, setPeriod] = React.useState(
    adminStore.activitiesFilters.period
  );
  const [openNewMission, setOpenNewMission] = React.useState(false);
  const [openLogHoliday, setOpenLogHoliday] = React.useState(false);
  const [dateRangeError, setDateRangeError] = React.useState("");
  const lastValidDateRangeRef = React.useRef({
    minDate: adminStore.activitiesFilters.minDate,
    maxDate: adminStore.activitiesFilters.maxDate
  });

  const minDateOfFetchedData = adminStore.minWorkDaysDate;

  const datePickerSlotProps = {
  textField: {
    size: "small",
    required: true,
    variant: "outlined",
    error: !!dateRangeError,
    helperText: dateRangeError,
    FormHelperTextProps: {
      sx: {
        position: "absolute",
        bottom: "-22px",
        left: 0,
        color: "error.main",
        fontSize: "0.75rem",
        margin: 0,
        whiteSpace: "nowrap"
      }
    }
  }
};

  const refreshCurrentWorkDays = () =>
    refreshWorkDays(
      setLoading,
      alerts,
      api,
      adminStore.userId,
      minDate,
      maxDate,
      company.id,
      (companiesPayload, newMinDate) =>
        adminStore.dispatch({
          type: ADMIN_ACTIONS.addWorkDays,
          payload: { companiesPayload, minDate: newMinDate, reset: true }
        }),
      (companiesPayload) =>
        adminStore.dispatch({
          type: ADMIN_ACTIONS.addUsers,
          payload: { companiesPayload }
        })
    );

  const today = new Date();
  // 1-year limit to avoid performance issues
  const maxAllowedEndDate = minDate ? addDays(new Date(minDate), 365) : today;
  const isDateRangeValid = React.useCallback((start, end) => {
    if (!start || !end || start > end) {
      return false;
    }

    const daysDiff = Math.ceil(
      (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 365;
  }, []);

  // Validate date range
  React.useEffect(() => {
    if (minDate && maxDate && !isDateRangeValid(minDate, maxDate)) {
      setDateRangeError("La période ne peut pas dépasser 1 an");
    } else {
      setDateRangeError("");
    }
  }, [minDate, maxDate, isDateRangeValid]);

  // Reload data when date range changes (backward pagination handled by onMinDateChange)
  const prevDateRangeRef = React.useRef({ minDate, maxDate });
  React.useEffect(() => {
    if (!minDate || !maxDate || !company?.id) return;

    if (!isDateRangeValid(minDate, maxDate)) {
      return;
    }

    lastValidDateRangeRef.current = { minDate, maxDate };

    const prevMinDate = prevDateRangeRef.current.minDate;
    const prevMaxDate = prevDateRangeRef.current.maxDate;

    // Reload if maxDate changed or minDate moved forward, and range is valid (≤ 365 days)
    const shouldReload = maxDate !== prevMaxDate || minDate > prevMinDate;

    if (shouldReload) {
      const timeoutId = setTimeout(() => {
        refreshCurrentWorkDays();
      }, 500); // 500ms debounce

      prevDateRangeRef.current = { minDate, maxDate };
      return () => clearTimeout(timeoutId);
    }
    
    prevDateRangeRef.current = { minDate, maxDate };
  }, [
    minDate,
    maxDate,
    company?.id,
    isDateRangeValid,
    alerts,
    api,
    adminStore,
    company
  ]);

  React.useEffect(() => {
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { period }
    });
  }, [period]);

  React.useEffect(() => {
    setUsers(adminStore.activitiesFilters.users);
  }, [adminStore.activitiesFilters.users]);

  React.useEffect(() => {
    setMinDate(adminStore.activitiesFilters.minDate);
  }, [adminStore.activitiesFilters.minDate]);

  React.useEffect(() => {
    if (minDate && (!maxDate || maxDate < minDate)) setMaxDate(minDate);
    if (!isDateRangeValid(minDate, maxDate)) {
      return;
    }

    onMinDateChange(
      minDate,
      minDateOfFetchedData,
      adminStore.userId,
      adminStore.companyId,
      setLoading,
      (companiesPayload, newMinDate) =>
        adminStore.dispatch({
          type: ADMIN_ACTIONS.addWorkDays,
          payload: { companiesPayload, minDate: newMinDate }
        }),
      (companiesPayload) =>
        adminStore.dispatch({
          type: ADMIN_ACTIONS.addUsers,
          payload: { companiesPayload }
        }),
      api,
      alerts
    );
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { minDate }
    });
  }, [minDate, maxDate, isDateRangeValid]);

  React.useEffect(() => {
    if (maxDate && !minDate) setMinDate(minDateOfFetchedData);
    if (maxDate && minDate && minDate > maxDate) setMinDate(maxDate);
    if (!isDateRangeValid(minDate, maxDate)) {
      return;
    }
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { maxDate }
    });
  }, [maxDate, minDate, isDateRangeValid]);

  const [exportMenuAnchorEl, setExportMenuAnchorEl] = React.useState(null);

  React.useEffect(() => {
    if (adminCompanies) {
      const newCompaniesWithCurrentSelectionStatus = adminCompanies.map(
        (company) => ({
          ...company,
          selected: company.id === adminStore.companyId
        })
      );
      setCompanies(newCompaniesWithCurrentSelectionStatus);
    }
  }, [adminCompanies]);

  React.useEffect(() => {
    setTeams(adminStore.activitiesFilters.teams);
  }, [adminStore.activitiesFilters.teams]);

  const handleUserFilterChange = (newUsers) => {
    const unselectedTeams = unselectAndGetAllTeams(teams);
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { teams: unselectedTeams, users: newUsers }
    });
  };

  const handleTeamFilterChange = (newTeams) => {
    const usersToSelect = getUsersToSelectFromTeamSelection(newTeams, users);
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { teams: newTeams, users: usersToSelect }
    });
  };

  React.useEffect(() => {
    trackEvent(ACTIVITY_FILTER_EMPLOYEE);
  }, [users]);

  const selectedUsers = React.useMemo(() => {
    const selected = users.filter((u) => u.selected);
    if (selected.length === 0) {
      return users;
    }
    return selected;
  }, [users]);

  const appliedDateRange = React.useMemo(() => {
    if (isDateRangeValid(minDate, maxDate)) {
      return { minDate, maxDate };
    }

    return lastValidDateRangeRef.current;
  }, [minDate, maxDate, isDateRangeValid]);

  const selectedWorkDays = React.useMemo(
    () =>
      adminStore.workDays.filter(
        (wd) =>
          selectedUsers.map((u) => u.id).includes(wd.user.id) &&
          (!appliedDateRange.minDate || wd.day >= appliedDateRange.minDate) &&
          (!appliedDateRange.maxDate || wd.day <= appliedDateRange.maxDate)
      ),
    [appliedDateRange, selectedUsers, adminStore.workDays]
  );

  // We create this object to have missions filled with stats easily accessible by id to avoid doing costly computations for each entry in the work time table.
  // This allows us to quickly look up mission details without iterating through the entire list of missions for each work day entry.
  const missionsById = React.useMemo(() => {
    const missions = missionWithStats(adminStore) || [];

    return missions.reduce((acc, mission) => {
      acc[mission.id] = mission;
      return acc;
    }, {});
  }, [adminStore]);


  const periodAggregates = React.useMemo(
    () => aggregateWorkDayPeriods(selectedWorkDays, period),
    [selectedWorkDays, period]
  );
  const ref = React.useRef(null);

  const classes = useStyles();
  return [
    <Paper
      className={`scrollable ${classes.container}`}
      variant="outlined"
      key={0}
      ref={ref}
    >
      <Box className={classes.pageHeader}>
        <Box className={classes.pageHeaderLeft}>
          <Typography component="h1" className={classes.pageTitle}>
            Activités
          </Typography>
          <LoadingButton
            priority="secondary"
            size="small"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => {
              trackEvent(ADMIN_ADD_MISSION);
              setOpenNewMission(true);
            }}
          >
            Ajouter des activités
          </LoadingButton>
          <LogHolidayButton
            priority="secondary"
            size="small"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => {
              trackEvent(ADMIN_ADD_HOLIDAY);
              setOpenLogHoliday(true);
            }}
          />
        </Box>
        <InactiveEmployeesDropdown
          employments={adminStore.employments}
          workDays={adminStore.workDays}
        />
      </Box>
      <Grid
        spacing={2}
        container
        alignItems="center"
        justifyContent="space-between"
        wrap="nowrap"
        className={classes.filterGrid}
      >
        {teams?.length > 0 && (
          <Grid item>
            <TeamFilter teams={teams} setTeams={handleTeamFilterChange} />
          </Grid>
        )}
        <Grid item>
          <EmployeeFilter users={users} setUsers={handleUserFilterChange} />
        </Grid>
        <Grid item>
          <PeriodToggle period={period} setPeriod={setPeriod} />
        </Grid>
        <Grid item>
          <MobileDatePicker
            label="Début"
            value={new Date(minDate)}
            inputFormat="d MMMM yyyy"
            fullWidth
            disableCloseOnSelect={false}
            disableMaskedInput={true}
            onAccept={(val) => {
              trackEvent(ACTIVITY_FILTER_MIN_DATE);
              setMinDate(isoFormatLocalDate(val));
            }}
            cancelText={null}
            maxDate={today}
            slotProps={datePickerSlotProps}
            // renderDay is needed to fix issue caused by key being passed with props
            renderDay={renderPickersDay}
          />
        </Grid>
        <Grid item>
          <MobileDatePicker
            label="Fin"
            value={new Date(maxDate)}
            inputFormat="d MMMM yyyy"
            fullWidth
            disableCloseOnSelect={false}
            disableMaskedInput={true}
            onAccept={(val) => {
              trackEvent(ACTIVITY_FILTER_MAX_DATE);
              setMaxDate(isoFormatLocalDate(val));
            }}
            cancelText={null}
            maxDate={maxAllowedEndDate > today ? today : maxAllowedEndDate}
            slotProps={datePickerSlotProps}
            // renderDay is needed to fix issue caused by key being passed with props
            renderDay={renderPickersDay}
          />
        </Grid>
        <Grid item>
          <Button
            onClick={(e) => setExportMenuAnchorEl(e.currentTarget)}
            size="medium"
          >
            Exporter
          </Button>
          <Menu
            keepMounted
            open={Boolean(exportMenuAnchorEl)}
            onClose={() => setExportMenuAnchorEl(null)}
            anchorEl={exportMenuAnchorEl}
          >
            <MenuItem
              onClick={() => {
                setExportMenuAnchorEl(null);
                trackEvent(ADMIN_EXPORT_EXCEL);
                modals.open("dataExport", {
                  companies,
                  initialUsers: adminStore.exportFilters.users,
                  initialTeams: adminStore.exportFilters.teams,
                  defaultCompany: company,
                  defaultMinDate: minDate ? new Date(minDate) : null,
                  defaultMaxDate: maxDate
                    ? new Date(maxDate)
                    : startOfDayAsDate(new Date()),
                  getUsersSinceDate
                });
              }}
            >
              <ListItemIcon>
                <SvgIcon viewBox="0 0 64 64" component={ExcelIcon} />
              </ListItemIcon>
              <Typography>Export Excel</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setExportMenuAnchorEl(null);
                trackEvent(ADMIN_EXPORT_C1B);
                modals.open("tachographExport", {
                  companies,
                  initialUsers: adminStore.exportFilters.users,
                  initialTeams: adminStore.exportFilters.teams,
                  defaultCompany: company,
                  defaultMinDate: minDate ? new Date(minDate) : null,
                  defaultMaxDate: maxDate
                    ? new Date(maxDate)
                    : startOfDayAsDate(new Date()),
                  getUsersSinceDate
                });
              }}
            >
              <ListItemIcon>
                <SvgIcon viewBox="0 0 640 512" component={TachoIcon} />
              </ListItemIcon>
              <Typography>Export C1B</Typography>
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
      <Box
        className={`flex-column ${classes.workTimeTableContainer}`}
        style={{ maxHeight: ref.current ? ref.current.clientHeight : 0 }}
        sx={{ marginTop: 1 }}
      >
        <WorkTimeTable
          className={classes.workTimeTable}
          period={period}
          workTimeEntries={periodAggregates}
          missionsById={missionsById}
          showExpenditures={adminStore.settings.requireExpenditures}
          showMissionName={adminStore.settings.requireMissionName}
          loading={loading}
        />
        <Drawer
          anchor="right"
          open={openLogHoliday}
          onClose={() => {
            setOpenLogHoliday(false);
          }}
        >
          <Box p={3} className={classes.missionTitleContainer}>
            <Typography variant="h1" className={classes.missionTitle}>
              Congé ou absence passé
            </Typography>
            <CloseButton
              onClick={() => {
                setOpenLogHoliday(false);
              }}
            />
          </Box>
          <LogHolidayForm
            users={users}
            handleSubmit={async (payload) =>
              await alerts.withApiErrorHandling(
                async () => {
                  await api.graphQlMutate(LOG_HOLIDAY_MUTATION, {
                    ...payload,
                    companyId: company.id
                  });
                  alerts.success(
                    "Votre congé ou absence a bien été enregistré(e)",
                    "",
                    6000
                  );
                  setOpenLogHoliday(false);
                  refreshCurrentWorkDays();
                },
                "create-holiday",
                (graphQLError) => {
                  if (
                    graphQLErrorMatchesCode(
                      graphQLError,
                      "OVERLAPPING_MISSIONS"
                    )
                  ) {
                    return "Des activités sont déjà enregistrées sur cette période.";
                  }
                }
              )
            }
          />
        </Drawer>
        <Drawer
          anchor="right"
          open={openNewMission}
          onClose={() => {
            setOpenNewMission(false);
          }}
        >
          <Box key={0} p={3} className={classes.missionTitleContainer}>
            <Typography variant="h1" className={classes.missionTitle}>
              Mission passée
            </Typography>
            <CloseButton
              onClick={() => {
                setOpenNewMission(false);
              }}
            />
          </Box>
          <NewMissionForm
            companies={adminCompanies}
            companyId={adminStore.companyId}
            overrideSettings={adminStore.settings}
            companyAddresses={adminStore.knownAddresses}
            currentPosition={null}
            disableGeolocation={true}
            disableKilometerReading={true}
            withDay={true}
            withEndLocation={true}
            handleSubmit={async (missionInfos) =>
              await alerts.withApiErrorHandling(async () => {
                const missionResponse = await api.graphQlMutate(
                  CREATE_MISSION_MUTATION,
                  {
                    name: missionInfos.mission,
                    companyId: missionInfos.company.id,
                    vehicleId: missionInfos.vehicle
                      ? missionInfos.vehicle.id
                      : null,
                    vehicleRegistrationNumber: missionInfos.vehicle
                      ? missionInfos.vehicle.registrationNumber
                      : null,
                    pastRegistrationJustification:
                      missionInfos.pastRegistrationJustification
                  }
                );
                const mission = missionResponse.data.activities.createMission;
                const startLocationResponse = api
                  .graphQlMutate(
                    LOG_LOCATION_MUTATION,
                    buildLogLocationPayloadFromAddress(
                      missionInfos.address,
                      mission.id,
                      true
                    )
                  )
                  .then((response) => response.data.activities.logLocation);

                const endLocationResponse = api
                  .graphQlMutate(
                    LOG_LOCATION_MUTATION,
                    buildLogLocationPayloadFromAddress(
                      missionInfos.endAddress,
                      mission.id,
                      false
                    )
                  )
                  .then((response) => response.data.activities.logLocation);

                await Promise.all([startLocationResponse, endLocationResponse]);
                history.push(`/admin/validations?mission=${mission.id}`, {
                  day: (new Date(missionInfos.day).getTime() / 1000) >> 0
                });
                setOpenNewMission(false);
              }, "create-mission")
            }
          />
        </Drawer>
      </Box>
    </Paper>
  ];
}

export default ActivitiesPanel;
