import React from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import size from "lodash/size";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import {
  formatDateTime,
  formatDay,
  formatTimeOfDay,
  formatTimer,
  prettyFormatDay
} from "common/utils/time";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { VALIDATE_MISSION_MUTATION } from "common/utils/apiQueries";
import { useStyles } from "../components/styles/ValidationsStyle";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useMissionDrawer } from "../components/MissionDrawer";
import { LoadingButton } from "common/components/LoadingButton";
import {
  entryToBeValidatedByAdmin,
  entryToBeValidatedByWorker,
  missionsToTableEntries
} from "../selectors/validationEntriesSelectors";
import groupBy from "lodash/groupBy";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  CHANGE_VALIDATION_TAB,
  OPEN_MISSION_DRAWER_IN_VALIDATION_PANEL,
  VALIDATE_MISSION_IN_VALIDATION_PANEL
} from "common/utils/matomoTags";
import Badge from "@mui/material/Badge";
import Grid from "@mui/material/Grid";
import { EmployeeFilter } from "../components/EmployeeFilter";
import { TeamFilter } from "../components/TeamFilter";
import {
  getUsersToSelectFromTeamSelection,
  unselectAndGetAllTeams
} from "../store/reducers/team";
import { usePageTitle } from "../../common/UsePageTitle";

const VALIDATION_TABS = [
  {
    label: "A valider",
    explanation:
      "Les missions suivantes ont été terminées et validées par le(s) salarié(s) concerné(s) et sont prêtes à être validées par un gestionnaire.",
    matomoName: "Onglet Validation Admin"
  },
  {
    label: "En attente de validation par les salariés",
    explanation:
      "Les missions suivantes ne sont pas terminées ou n'ont pas encore été validées par tous les salariés concernés.",
    matomoName: "Onglet Validation Salarié"
  },
  {
    label: "Missions validées",
    explanation:
      "Les missions suivantes ont été validées par salarié(s) et gestionnaire. Elles ne sont plus modifiables.",
    matomoName: "Onglet Validées"
  },
  {
    label: "Missions supprimées",
    explanation: "Les missions suivantes ont été supprimées.",
    matomoName: "Onglet Supprimées"
  }
];

const formatMissionName = mission =>
  `${mission.isHoliday ? "" : "Mission "}${mission.name} du ${formatDay(
    mission.startTime
  )}`;

function ValidationPanel() {
  usePageTitle("Validation Saisie(s) - Mobilic");
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();
  const location = useLocation();
  const { trackEvent } = useMatomo();

  const [tab, setTab] = React.useState(0);
  const [tableEntries, setTableEntries] = React.useState([]);
  const [tableColumns, setTableColumns] = React.useState([]);
  const [users, setUsers] = React.useState(adminStore.validationsFilters.users);
  const [teams, setTeams] = React.useState(adminStore.validationsFilters.teams);
  const [
    entriesToValidateByAdmin,
    setEntriesToValidateByAdmin
  ] = React.useState([]);
  const [
    entriesToValidateByWorker,
    setEntriesToValidateByWorker
  ] = React.useState([]);
  const [entriesValidatedByAdmin, setEntriesValidatedByAdmin] = React.useState(
    []
  );
  const [entriesDeletedByAdmin, setEntriesDeletedByAdmin] = React.useState([]);
  const [
    nbMissionsToValidateByAdmin,
    setNbMissionsToValidateByAdmin
  ] = React.useState(0);
  const [
    nbMissionsToValidateByWorker,
    setNbMissionsToValidateByWorker
  ] = React.useState(0);
  const classes = useStyles({ clickableRow: tab === 0 });

  const [missionIdOnFocus, openMission] = useMissionDrawer();

  const ref = React.useRef();

  const showExpenditures = adminStore.settings.requireExpenditures;

  const allowTransfers = adminStore.settings.allowTransfers;

  const inProgress = entry =>
    entry.isDeleted ? (
      "-"
    ) : (
      <span className={classes.warningText}>
        <strong>En cours</strong>
      </span>
    );

  const commonCols = [
    {
      label: "Salarié",
      name: "user",
      align: "left",
      minWidth: 200,
      format: (person, _) => formatPersonName(person),
      overflowTooltip: true,
      alwaysShowTooltip: true
    },
    {
      label: "Début",
      name: "startTime",
      align: "left",
      format: (time, entry) =>
        (entry.multipleDays ? formatDateTime : formatTimeOfDay)(time),
      minWidth: 80
    },
    {
      label: "Fin",
      name: "endTime",
      align: "left",
      format: (time, entry) =>
        entry.isComplete
          ? (entry.multipleDays ? formatDateTime : formatTimeOfDay)(time)
          : inProgress(entry),
      minWidth: 80
    },
    {
      label: "Amplitude",
      name: "service",
      format: (time, entry) =>
        entry.isComplete ? formatTimer(time) : inProgress(entry),
      align: "right",
      minWidth: 100
    },
    {
      label: "Travail",
      name: "totalWorkDuration",
      format: (time, entry) =>
        entry.isComplete ? formatTimer(time) : inProgress(entry),
      align: "right",
      minWidth: 100
    },
    allowTransfers && {
      label: "Liaison",
      name: "transferDuration",
      format: (time, entry) =>
        entry.isComplete ? formatTimer(time) : inProgress(entry),
      align: "right",
      minWidth: 100
    },
    {
      label: "Repos",
      name: "breakDuration",
      format: (time, entry) =>
        entry.isComplete ? formatTimer(time) : inProgress(entry),
      align: "right",
      minWidth: 100
    },
    showExpenditures && {
      label: "Frais",
      name: "expenditures",
      format: exps => (exps ? formatExpendituresAsOneString(exps) : null),
      align: "left",
      minWidth: 150,
      overflowTooltip: true
    }
  ].filter(Boolean);

  const validationEmployeeCol = {
    label: "Validation salarié",
    name: "validation",
    format: validation => (
      <Typography
        className={`${validation ? classes.successText : classes.warningText}`}
      >
        {validation ? "✅ Validé" : "⏳ En attente"}
      </Typography>
    ),
    align: "left",
    minWidth: 200
  };

  const validationAdminCol = {
    label: "Date de validation",
    name: "adminValidation",
    format: adminGlobalValidation => (
      <Typography>
        {adminGlobalValidation
          ? formatDay(adminGlobalValidation.receptionTime, true)
          : ""}
      </Typography>
    ),
    align: "left",
    minWidth: 200
  };

  const deletionCol = {
    label: "Date de suppression",
    name: "deletion",
    format: (_, entry) => (
      <Typography>{prettyFormatDay(entry.deletedAt, true)}</Typography>
    ),
    align: "left",
    minWidth: 200
  };

  React.useEffect(() => {
    setEntriesDeletedByAdmin(
      missionsToTableEntries(adminStore).filter(entry => entry.isDeleted)
    );
    setEntriesToValidateByAdmin(
      missionsToTableEntries(adminStore).filter(entry =>
        entryToBeValidatedByAdmin(entry, adminStore.userId)
      )
    );
    setEntriesToValidateByWorker(
      missionsToTableEntries(adminStore)
        .filter(entry => !entry.isDeleted)
        .filter(entryToBeValidatedByWorker)
    );
    setEntriesValidatedByAdmin(
      missionsToTableEntries(adminStore).filter(
        tableEntry => tableEntry.adminValidation
      )
    );
  }, [adminStore.missions, users]);

  React.useEffect(() => {
    setNbMissionsToValidateByAdmin(
      size(groupBy(entriesToValidateByAdmin, "missionId"))
    );
  }, [entriesToValidateByAdmin]);

  React.useEffect(() => {
    setNbMissionsToValidateByWorker(
      size(groupBy(entriesToValidateByWorker, "missionId"))
    );
  }, [entriesToValidateByWorker]);

  React.useEffect(() => {
    setUsers(adminStore.validationsFilters.users);
  }, [adminStore.validationsFilters.users]);

  React.useEffect(() => {
    setTeams(adminStore.validationsFilters.teams);
  }, [adminStore.validationsFilters.teams]);

  const handleUserFilterChange = newUsers => {
    const unselectedTeams = unselectAndGetAllTeams(teams);
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateValidationsFilters,
      payload: { teams: unselectedTeams, users: newUsers }
    });
  };

  const handleTeamFilterChange = newTeams => {
    const usersToSelect = getUsersToSelectFromTeamSelection(newTeams, users);
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateValidationsFilters,
      payload: { teams: newTeams, users: usersToSelect }
    });
  };

  React.useEffect(() => {
    switch (tab) {
      case 0:
        setTableEntries(entriesToValidateByAdmin);
        setTableColumns(commonCols);
        break;
      case 1:
        setTableEntries(entriesToValidateByWorker);
        setTableColumns([...commonCols, validationEmployeeCol]);
        break;
      case 2:
        setTableEntries(entriesValidatedByAdmin);
        setTableColumns([...commonCols, validationAdminCol]);
        break;
      case 3:
        setTableEntries(entriesDeletedByAdmin);
        setTableColumns([...commonCols, deletionCol]);
        break;
      default:
        setTableColumns([]);
        setTableEntries([]);
    }
  }, [
    tab,
    entriesToValidateByAdmin,
    entriesToValidateByWorker,
    entriesValidatedByAdmin,
    entriesDeletedByAdmin
  ]);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const missionId = parseInt(queryString.get("mission"));

    openMission(missionId || null);
  }, [location]);

  return (
    <Paper className={classes.container} variant="outlined">
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={(e, newTab) => {
          trackEvent(CHANGE_VALIDATION_TAB(VALIDATION_TABS[newTab].matomoName));
          setTab(newTab);
        }}
        className={classes.tabContainer}
        variant="scrollable"
      >
        <Tab
          className={
            nbMissionsToValidateByAdmin > 0 ? classes.tabWithBadge : classes.tab
          }
          label={
            <Badge
              badgeContent={nbMissionsToValidateByAdmin}
              color="error"
              className={classes.customBadge}
            >
              {VALIDATION_TABS[0].label}
            </Badge>
          }
        />
        <Tab
          className={
            nbMissionsToValidateByWorker > 0
              ? classes.tabWithBadge
              : classes.tab
          }
          label={
            <Badge
              badgeContent={nbMissionsToValidateByWorker}
              color="warning"
              className={classes.customBadge}
            >
              {VALIDATION_TABS[1].label}
            </Badge>
          }
        />
        <Tab className={classes.tab} label={VALIDATION_TABS[2].label} />
        <Tab className={classes.tab} label={VALIDATION_TABS[3].label} />
      </Tabs>
      <Grid
        spacing={teams?.length > 0 ? 2 : 0}
        container
        className={classes.filterGrid}
      >
        <Grid item>
          {teams?.length > 0 && (
            <TeamFilter teams={teams} setTeams={handleTeamFilterChange} />
          )}
        </Grid>
        <Grid item>
          {users?.length > 0 && (
            <EmployeeFilter users={users} setUsers={handleUserFilterChange} />
          )}
        </Grid>
      </Grid>
      <Typography className={classes.explanation}>
        {VALIDATION_TABS[tab].explanation}
      </Typography>
      <AugmentedTable
        columns={tableColumns}
        entries={tableEntries}
        ref={ref}
        virtualizedRowHeight={entry => (entry.__groupKey ? 50 : 35)}
        alwaysSortBy={[
          ["missionStartTime", "desc"],
          ["missionId", "desc"]
        ]}
        interGroupHeight={30}
        virtualized
        maxHeight={"100%"}
        defaultSortBy="startTime"
        defaultSortType="desc"
        className={classes.virtualizedTableContainer}
        disableGroupCollapse
        onRowGroupClick={entry => {
          trackEvent(OPEN_MISSION_DRAWER_IN_VALIDATION_PANEL);
          openMission(entry.id);
        }}
        rowClassName={entry =>
          `${classes.row} ${
            missionIdOnFocus && entry.missionId === missionIdOnFocus
              ? classes.selectedRow
              : ""
          }`
        }
        groupByColumn={{
          label: "Mission",
          name: "missionId",
          format: (value, entry) => (
            <Box className="flex-row-space-between">
              <Typography
                variant="h6"
                component="span"
                className={classes.missionTitle}
              >
                {formatMissionName(entry)}
              </Typography>
              {tab === 0 && (
                <LoadingButton
                  aria-label="Valider"
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={async e => {
                    e.stopPropagation();
                    trackEvent(VALIDATE_MISSION_IN_VALIDATION_PANEL);
                    try {
                      const usersToValidate = entriesToValidateByAdmin
                        .filter(
                          entryToValidate =>
                            entryToValidate.missionId === entry.id
                        )
                        .map(
                          workerEntryToValidate => workerEntryToValidate.user.id
                        );
                      const apiResponse = await api.graphQlMutate(
                        VALIDATE_MISSION_MUTATION,
                        {
                          missionId: entry.id,
                          usersIds: usersToValidate
                        }
                      );
                      const missionResponse =
                        apiResponse.data.activities.validateMission;
                      adminStore.dispatch({
                        type: ADMIN_ACTIONS.validateMission,
                        payload: { missionResponse }
                      });
                      alerts.success(
                        `La mission${
                          entry.name ? " " + entry.name : ""
                        } a été validée avec succès !`,
                        entry.id,
                        6000
                      );
                    } catch (err) {
                      alerts.error(formatApiError(err), entry.id, 6000);
                    }
                  }}
                >
                  Valider
                </LoadingButton>
              )}
            </Box>
          ),
          groupProps: ["name", "startTime", "isHoliday"]
        }}
        headerClassName={`${classes.header} ${classes.row}`}
      />
    </Paper>
  );
}

export default ValidationPanel;
