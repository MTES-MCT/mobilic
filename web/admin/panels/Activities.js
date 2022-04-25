import React from "react";
import debounce from "lodash/debounce";
import { useHistory } from "react-router-dom";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Paper from "@mui/material/Paper";
import { PeriodToggle } from "../components/PeriodToggle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useWidth } from "common/utils/useWidth";
import { WorkTimeTable } from "../components/WorkTimeTable";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import { useAdminStore, useAdminCompanies } from "../store/store";
import { useModals } from "common/utils/modals";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import {
  formatDay,
  isoFormatLocalDate,
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
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import {
  ADMIN_WORK_DAYS_QUERY,
  buildLogLocationPayloadFromAddress,
  CREATE_MISSION_MUTATION,
  LOG_LOCATION_MUTATION
} from "common/utils/apiQueries";
import MobileDatePicker from "@mui/lab/MobileDatePicker";
import TextField from "@mui/material/TextField";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ACTIVITY_FILTER_EMPLOYEE,
  ACTIVITY_FILTER_MAX_DATE,
  ACTIVITY_FILTER_MIN_DATE,
  ADMIN_ADD_MISSION,
  ADMIN_EXPORT_C1B,
  ADMIN_EXPORT_EXCEL
} from "common/utils/matomoTags";

const useStyles = makeStyles(theme => ({
  filterGrid: {
    paddingTop: theme.spacing(2),
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
    flexGrow: 1
  },
  workTimeTable: {
    overflowY: "hidden",
    flexGrow: 1,
    paddingTop: theme.spacing(1)
  },
  workTimeTableContainer: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1)
  },
  closeButton: {
    padding: 0
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

const onMinDateChange = debounce(
  async (
    newMinDate,
    maxDate,
    userId,
    companyId,
    setLoading,
    addWorkDays,
    api,
    alerts
  ) => {
    if (newMinDate < maxDate) {
      setLoading(true);
      await alerts.withApiErrorHandling(async () => {
        const companiesPayload = await api.graphQlQuery(ADMIN_WORK_DAYS_QUERY, {
          id: userId,
          activityAfter: newMinDate,
          activityBefore: maxDate,
          companyIds: [companyId]
        });
        addWorkDays(companiesPayload.data.user.adminedCompanies, newMinDate);
      }, "load-work-days");
      setLoading(false);
    }
  },
  500
);

function ActivitiesPanel() {
  const adminStore = useAdminStore();
  const [adminCompanies] = useAdminCompanies();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const history = useHistory();
  const { trackEvent } = useMatomo();

  const [users, setUsers] = React.useState(adminStore.activitiesFilters.users);
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

  const minDateOfFetchedData = adminStore.minWorkDaysDate;

  const today = new Date();

  React.useEffect(() => {
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { period }
    });
  }, [period]);

  React.useEffect(() => {
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { users }
    });
  }, [users]);

  React.useEffect(() => {
    setUsers(adminStore.activitiesFilters.users);
  }, [adminStore.activitiesFilters.users]);

  React.useEffect(() => {
    setMinDate(adminStore.activitiesFilters.minDate);
  }, [adminStore.activitiesFilters.minDate]);

  React.useEffect(() => {
    if (minDate && (!maxDate || maxDate < minDate)) setMaxDate(minDate);
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

      api,
      alerts
    );
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { minDate }
    });
  }, [minDate]);

  React.useEffect(() => {
    if (maxDate && !minDate) setMinDate(minDateOfFetchedData);
    if (maxDate && minDate && minDate > maxDate) setMinDate(maxDate);
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { maxDate }
    });
  }, [maxDate]);

  const [exportMenuAnchorEl, setExportMenuAnchorEl] = React.useState(null);

  React.useEffect(() => {
    if (adminCompanies) {
      const newCompaniesWithCurrentSelectionStatus = adminCompanies.map(
        company => ({
          ...company,
          selected: company.id === adminStore.companyId
        })
      );
      setCompanies(newCompaniesWithCurrentSelectionStatus);
    }
  }, [adminCompanies]);

  let selectedCompanies = companies.filter(c => c.selected);
  if (selectedCompanies.length === 0) selectedCompanies = companies;

  React.useEffect(() => {
    trackEvent(ACTIVITY_FILTER_EMPLOYEE);
  }, [users]);

  let selectedUsers = users.filter(u => u.selected);
  if (selectedUsers.length === 0) selectedUsers = users;

  const selectedWorkDays = adminStore.workDays.filter(
    wd =>
      selectedUsers.map(u => u.id).includes(wd.user.id) &&
      (!minDate || wd.day >= minDate) &&
      (!maxDate || wd.day <= maxDate)
  );

  // TODO : memoize this
  const periodAggregates = aggregateWorkDayPeriods(selectedWorkDays, period);
  const ref = React.useRef(null);
  const width = useWidth();

  const classes = useStyles();
  return [
    <Paper
      className={`scrollable ${classes.container}`}
      variant="outlined"
      key={0}
      ref={ref}
    >
      <Grid
        spacing={2}
        container
        alignItems="center"
        justifyContent="space-between"
        className={classes.filterGrid}
      >
        <Grid item>
          <EmployeeFilter users={users} setUsers={setUsers} />
        </Grid>
        <Grid item>
          <PeriodToggle period={period} setPeriod={setPeriod} />
        </Grid>
        <Grid item>
          <MobileDatePicker
            label="Début"
            value={minDate}
            inputFormat="d MMMM yyyy"
            fullWidth
            disableCloseOnSelect={false}
            disableMaskedInput={true}
            onChange={val => {
              trackEvent(ACTIVITY_FILTER_MIN_DATE);
              setMinDate(isoFormatLocalDate(val));
            }}
            cancelText={null}
            maxDate={today}
            renderInput={props => (
              <TextField {...props} required variant="outlined" size="small" />
            )}
          />
        </Grid>
        <Grid item>
          <MobileDatePicker
            label="Fin"
            value={maxDate}
            inputFormat="d MMMM yyyy"
            fullWidth
            disableCloseOnSelect={false}
            disableMaskedInput={true}
            onChange={val => {
              trackEvent(ACTIVITY_FILTER_MAX_DATE);
              setMaxDate(isoFormatLocalDate(val));
            }}
            cancelText={null}
            maxDate={today}
            renderInput={props => (
              <TextField {...props} required variant="outlined" size="small" />
            )}
          />
        </Grid>
        <Grid item>
          <Button
            className={classes.exportButton}
            color="primary"
            onClick={e => setExportMenuAnchorEl(e.currentTarget)}
            variant="contained"
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
                  users,
                  defaultMinDate: minDate ? new Date(minDate) : null,
                  defaultMaxDate: maxDate
                    ? new Date(maxDate)
                    : startOfDayAsDate(new Date())
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
                  users,
                  defaultMinDate: minDate ? new Date(minDate) : null,
                  defaultMaxDate: maxDate
                    ? new Date(maxDate)
                    : startOfDayAsDate(new Date())
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
      >
        <Typography align="left" variant="h6">
          {`${periodAggregates.length} résultats${
            periodAggregates.length > 0
              ? ` pour ${
                  uniq(periodAggregates.map(pa => pa.user.id)).length
                } salarié(s) entre le ${formatDay(
                  min(periodAggregates.map(pa => pa.periodActualStart))
                )} et le ${formatDay(
                  max(periodAggregates.map(pa => pa.periodActualEnd))
                )} (uniquement les plus récents).`
              : "."
          }`}
        </Typography>
        <LoadingButton
          style={{ marginTop: 8, alignSelf: "flex-start" }}
          color="primary"
          variant="contained"
          size="small"
          className={classes.subButton}
          onClick={() => {
            trackEvent(ADMIN_ADD_MISSION);
            setOpenNewMission(true);
          }}
        >
          Ajouter des activités
        </LoadingButton>
        <WorkTimeTable
          className={classes.workTimeTable}
          period={period}
          workTimeEntries={periodAggregates}
          showExpenditures={adminStore.settings.requireExpenditures}
          showMissionName={adminStore.settings.requireMissionName}
          showTransfers={adminStore.settings.allowTransfers}
          loading={loading}
          width={width}
        />
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
            <IconButton
              aria-label="Fermer"
              className={classes.closeButton}
              onClick={() => {
                setOpenNewMission(false);
              }}
            >
              <CloseIcon />
            </IconButton>
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
            handleSubmit={async missionInfos =>
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
                      : null
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
                  .then(response => response.data.activities.logLocation);

                const endLocationResponse = api
                  .graphQlMutate(
                    LOG_LOCATION_MUTATION,
                    buildLogLocationPayloadFromAddress(
                      missionInfos.endAddress,
                      mission.id,
                      false
                    )
                  )
                  .then(response => response.data.activities.logLocation);

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
