import React from "react";
import debounce from "lodash/debounce";
import { useHistory } from "react-router-dom";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Paper from "@mui/material/Paper";
import { PeriodToggle } from "../components/PeriodToggle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import useTheme from "@mui/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import { WorkTimeTable } from "../components/WorkTimeTable";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import { useAdminStore } from "../store/store";
import { useModals } from "common/utils/modals";
import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import { CompanyFilter } from "../components/CompanyFilter";
import Typography from "@mui/material/Typography";
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
import DatePicker from "@mui/lab/DatePicker";
import TextField from "@mui/material/TextField";
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

/**
 * Be careful using this hook. It only works because the number of
 * breakpoints in theme is static. It will break once you change the number of
 * breakpoints. See https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
 */
function useWidth() {
  const theme = useTheme();
  const keys = [...theme.breakpoints.keys].reverse();
  return (
    keys.reduce((output, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useMediaQuery(theme.breakpoints.up(key));
      return !output && matches ? key : output;
    }, null) || "xs"
  );
}

const onMinDateChange = debounce(
  async (newMinDate, maxDate, userId, setLoading, addWorkDays, api, alerts) => {
    if (newMinDate < maxDate) {
      setLoading(true);
      await alerts.withApiErrorHandling(async () => {
        const companiesPayload = await api.graphQlQuery(ADMIN_WORK_DAYS_QUERY, {
          id: userId,
          activityAfter: newMinDate,
          activityBefore: maxDate
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
    if (adminStore.companies) {
      const newCompaniesWithCurrentSelectionStatus = adminStore.companies.map(
        company => {
          const companyMatch = companies.find(c => c.id === company.id);
          return companyMatch
            ? { ...company, selected: companyMatch.selected }
            : company;
        }
      );
      setCompanies(newCompaniesWithCurrentSelectionStatus);
    }
  }, [adminStore.companies]);

  let selectedCompanies = companies.filter(c => c.selected);
  if (selectedCompanies.length === 0) selectedCompanies = companies;

  React.useEffect(() => {
    setUsers(
      uniqBy(
        adminStore.users.filter(u =>
          selectedCompanies.map(c => c.id).includes(u.companyId)
        ),
        u => u.id
      )
    );
  }, [companies, adminStore.users]);

  let selectedUsers = users.filter(u => u.selected);
  if (selectedUsers.length === 0) selectedUsers = users;

  const selectedWorkDays = adminStore.workDays.filter(
    wd =>
      selectedUsers.map(u => u.id).includes(wd.user.id) &&
      selectedCompanies.map(c => c.id).includes(wd.companyId) &&
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
        {companies.length > 1 && (
          <Grid item>
            <CompanyFilter companies={companies} setCompanies={setCompanies} />
          </Grid>
        )}
        <Grid item>
          <EmployeeFilter users={users} setUsers={setUsers} />
        </Grid>
        <Grid item>
          <PeriodToggle period={period} setPeriod={setPeriod} />
        </Grid>
        <Grid item>
          <DatePicker
            required
            value={new Date(minDate)}
            size="small"
            inputFormat="d MMMM yyyy"
            fullWidth
            onChange={val => setMinDate(isoFormatLocalDate(val))}
            cancelLabel={null}
            autoOk
            disableFuture
            inputVariant="outlined"
            animateYearScrolling
            renderInput={props => (
              <TextField variant="standard" label="Début" />
            )}
          />
        </Grid>
        <Grid item>
          <DatePicker
            required
            value={new Date(maxDate)}
            inputFormat="d MMMM yyyy"
            fullWidth
            size="small"
            onChange={val => setMaxDate(isoFormatLocalDate(val))}
            cancelLabel={null}
            autoOk
            disableFuture
            inputVariant="outlined"
            animateYearScrolling
            renderInput={props => <TextField variant="standard" label="Fin" />}
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
          {`${periodAggregates.length} résultats ${periodAggregates.length >
            0 &&
            `pour ${
              uniq(periodAggregates.map(pa => pa.user.id)).length
            } employé(s) entre le ${formatDay(
              min(periodAggregates.map(pa => pa.periodActualStart))
            )} et le ${formatDay(
              max(periodAggregates.map(pa => pa.periodActualEnd))
            )} (uniquement les plus récents).`}`}
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
          showExpenditures={selectedCompanies.some(
            c => c.settings.requireExpenditures
          )}
          showMissionName={selectedCompanies.some(
            c => c.settings.requireMissionName
          )}
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
            companies={adminStore.companies}
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

export default ActivitiesPanel;
