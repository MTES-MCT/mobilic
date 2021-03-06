import React from "react";
import { useHistory } from "react-router-dom";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Paper from "@material-ui/core/Paper";
import { PeriodToggle } from "../components/PeriodToggle";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { WorkTimeTable } from "../components/WorkTimeTable";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import { useAdminStore } from "../utils/store";
import { useModals } from "common/utils/modals";
import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import { CompanyFilter } from "../components/CompanyFilter";
import Typography from "@material-ui/core/Typography";
import { formatDay } from "common/utils/time";
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
  buildLogLocationPayloadFromAddress,
  CREATE_MISSION_MUTATION,
  LOG_LOCATION_MUTATION
} from "common/utils/apiQueries";

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

export default function ActivityPanel() {
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const history = useHistory();

  const [users, setUsers] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [period, setPeriod] = React.useState("day");
  const [openNewMission, setOpenNewMission] = React.useState(false);

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
      selectedCompanies.map(c => c.id).includes(wd.companyId)
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
        <Grid item spacing={4}>
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
                modals.open("dataExport", { companies, users });
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
                modals.open("tachographExport", { companies, users });
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
