import React from "react";
import debounce from "lodash/debounce";
import { useHistory } from "react-router-dom";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Paper from "@material-ui/core/Paper";
import { PeriodToggle } from "../components/PeriodToggle";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { WorkTimeTable } from "../components/WorkTimeTable";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import { useAdminStore, useAdminCompanies } from "../store/store";
import { useModals } from "common/utils/modals";
import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import Typography from "@material-ui/core/Typography";
import {
  formatDay,
  isoFormatLocalDate,
  startOfDayAsDate
} from "common/utils/time";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu/Menu";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import SvgIcon from "@material-ui/core/SvgIcon";
import { ReactComponent as ExcelIcon } from "common/assets/images/excel.svg";
import { ReactComponent as TachoIcon } from "common/assets/images/tacho.svg";
import { LoadingButton } from "common/components/LoadingButton";
import Drawer from "@material-ui/core/Drawer/Drawer";
import NewMissionForm from "../../common/NewMissionForm";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import {
  ADMIN_WORK_DAYS_QUERY,
  buildLogLocationPayloadFromAddress,
  CREATE_MISSION_MUTATION,
  LOG_LOCATION_MUTATION
} from "common/utils/apiQueries";
import { DatePicker } from "@material-ui/pickers";
import withWidth from "@material-ui/core/withWidth";
import { ADMIN_ACTIONS } from "../store/reducers/root";

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

function _ActivityPanel({ width }) {
  const adminStore = useAdminStore();
  const [adminCompanies] = useAdminCompanies();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const history = useHistory();

  const [users, setUsers] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(
    isoFormatLocalDate(new Date(Date.now()))
  );
  const [loading, setLoading] = React.useState(false);
  const [period, setPeriod] = React.useState("day");
  const [openNewMission, setOpenNewMission] = React.useState(false);

  const minDateOfFetchedData = adminStore.minWorkDaysDate;

  React.useEffect(() => {
    if (minDate !== adminStore.minWorkDaysDate)
      setMinDate(adminStore.minWorkDaysDate);
  }, [adminStore.minWorkDaysDate]);

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
  }, [minDate]);

  React.useEffect(() => {
    if (maxDate && !minDate) setMinDate(minDateOfFetchedData);
    if (maxDate && minDate && minDate > maxDate) setMinDate(maxDate);
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
    setUsers(uniqBy(adminStore.users, u => u.id));
  }, [adminStore.users]);

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
        justify="space-between"
        className={classes.filterGrid}
      >
        <Grid item>
          <EmployeeFilter users={users} setUsers={setUsers} />
        </Grid>
        <Grid item>
          <PeriodToggle period={period} setPeriod={setPeriod} />
        </Grid>
        <Grid item>
          <DatePicker
            required
            label="Début"
            value={new Date(minDate)}
            size="small"
            format="d MMMM yyyy"
            fullWidth
            onChange={val => setMinDate(isoFormatLocalDate(val))}
            cancelLabel={null}
            autoOk
            disableFuture
            inputVariant="outlined"
            animateYearScrolling
          />
        </Grid>
        <Grid item>
          <DatePicker
            required
            label="Fin"
            value={new Date(maxDate)}
            format="d MMMM yyyy"
            fullWidth
            size="small"
            onChange={val => setMaxDate(isoFormatLocalDate(val))}
            cancelLabel={null}
            autoOk
            disableFuture
            inputVariant="outlined"
            animateYearScrolling
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
                } employé(s) entre le ${formatDay(
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

const ActivitiesPanel = withWidth()(_ActivityPanel);

export default ActivitiesPanel;
