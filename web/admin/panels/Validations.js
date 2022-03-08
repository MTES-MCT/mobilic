import React from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import size from "lodash/size";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import {
  formatDateTime,
  formatDay,
  formatTimeOfDay,
  formatTimer
} from "common/utils/time";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import withWidth from "@material-ui/core/withWidth";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { VALIDATE_MISSION_MUTATION } from "common/utils/apiQueries";
import { useStyles } from "../components/styles/ValidationsStyle";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useMissionDrawer } from "../components/MissionDrawer";
import { CompanyFilter } from "../components/CompanyFilter";
import { LoadingButton } from "common/components/LoadingButton";
import {
  entryToBeValidatedByAdmin,
  entryToBeValidatedByWorker,
  missionsToTableEntries
} from "../selectors/validationEntriesSelectors";
import groupBy from "lodash/groupBy";

function _ValidationPanel() {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();
  const location = useLocation();

  const [tab, setTab] = React.useState(0);
  const [tableEntries, setTableEntries] = React.useState([]);
  const [tableColumns, setTableColumns] = React.useState([]);
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
  const [
    nbMissionsToValidateByAdmin,
    setNbMissionsToValidateByAdmin
  ] = React.useState(0);
  const [
    nbMissionsToValidateByWorker,
    setNbMissionsToValidateByWorker
  ] = React.useState(0);
  const [
    nbMissionsValidatedByAdmin,
    setNbMissionsValidatedByAdmin
  ] = React.useState(0);
  const classes = useStyles({ clickableRow: tab === 0 });

  const [missionIdOnFocus, openMission] = useMissionDrawer();
  const companies = adminStore.companies;

  const [companiesWithSelection, setCompaniesWithSelection] = React.useState(
    []
  );

  React.useEffect(() => setCompaniesWithSelection(companies), [companies]);

  const selectedCompanyIds = (companiesWithSelection.some(c => c.selected)
    ? companiesWithSelection.filter(c => c.selected)
    : companiesWithSelection
  ).map(c => c.id);

  const ref = React.useRef();

  const showExpenditures = adminStore.companies.some(
    c => c.settings.requireExpenditures
  );

  const allowTransfers = adminStore.companies.some(
    c => c.settings.allowTransfers
  );

  const commonCols = [
    {
      label: "Employé",
      name: "user",
      align: "left",
      minWidth: 200,
      format: formatPersonName,
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
        entry.isComplete ? (
          (entry.multipleDays ? formatDateTime : formatTimeOfDay)(time)
        ) : (
          <span className={classes.warningText}>
            <strong>En cours</strong>
          </span>
        ),
      minWidth: 80
    },
    {
      label: "Amplitude",
      name: "service",
      format: (time, entry) =>
        entry.isComplete ? (
          formatTimer(time)
        ) : (
          <span className={classes.warningText}>
            <strong>En cours</strong>
          </span>
        ),
      align: "right",
      minWidth: 100
    },
    {
      label: "Travail",
      name: "totalWorkDuration",
      format: (time, entry) =>
        entry.isComplete ? (
          formatTimer(time)
        ) : (
          <span className={classes.warningText}>
            <strong>En cours</strong>
          </span>
        ),
      align: "right",
      minWidth: 100
    },
    allowTransfers && {
      label: "Liaison",
      name: "transferDuration",
      format: (time, entry) =>
        entry.isComplete ? (
          formatTimer(time)
        ) : (
          <span className={classes.warningText}>
            <strong>En cours</strong>
          </span>
        ),
      align: "right",
      minWidth: 100
    },
    {
      label: "Repos",
      name: "breakDuration",
      format: (time, entry) =>
        entry.isComplete ? (
          formatTimer(time)
        ) : (
          <span className={classes.warningText}>
            <strong>En cours</strong>
          </span>
        ),
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

  const selectedCompanyFilter = validationEntry =>
    selectedCompanyIds.includes(validationEntry.companyId);

  React.useEffect(() => {
    setEntriesToValidateByAdmin(
      missionsToTableEntries(adminStore)
        .filter(entry => entryToBeValidatedByAdmin(entry, adminStore.userId))
        .filter(selectedCompanyFilter)
    );
    setEntriesToValidateByWorker(
      missionsToTableEntries(adminStore)
        .filter(entryToBeValidatedByWorker)
        .filter(selectedCompanyFilter)
    );
    setEntriesValidatedByAdmin(
      missionsToTableEntries(adminStore)
        .filter(tableEntry => tableEntry.adminValidation)
        .filter(selectedCompanyFilter)
    );
  }, [adminStore.missions, companiesWithSelection]);

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
    setNbMissionsValidatedByAdmin(
      size(groupBy(entriesValidatedByAdmin, "missionId"))
    );
  }, [entriesValidatedByAdmin]);

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
      default:
        setTableColumns([]);
        setTableEntries([]);
    }
  }, [
    tab,
    entriesToValidateByAdmin,
    entriesToValidateByWorker,
    entriesValidatedByAdmin
  ]);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const missionId = parseInt(queryString.get("mission"));

    openMission(missionId || null);
  }, [location]);

  return (
    <Paper className={classes.container} variant="outlined">
      {companies.length > 1 && (
        <CompanyFilter
          companies={companiesWithSelection}
          setCompanies={setCompaniesWithSelection}
          className={classes.companyFilter}
        />
      )}
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={(e, newTab) => {
          setTab(newTab);
        }}
        className={classes.tabContainer}
        variant="scrollable"
      >
        <Tab
          className={classes.tab}
          label={`A valider (${nbMissionsToValidateByAdmin})`}
        />
        <Tab
          className={classes.tab}
          label={`En attente de validation par les salariés (${nbMissionsToValidateByWorker})`}
        />
        <Tab
          className={classes.tab}
          label={`Missions validées (${nbMissionsValidatedByAdmin})`}
        />
      </Tabs>
      <Typography className={classes.explanation}>
        {tab === 0 &&
          "Les missions suivantes ont été terminées et validées par le(s) salarié(s) concerné(s) et sont prêtes à être validées par un gestionnaire."}
        {tab === 1 &&
          "Les missions suivantes sont terminées mais n'ont pas encore été validées par tous les salariés concernés."}
        {tab === 2 &&
          "Les missions suivantes ont été validées par salarié(s) et gestionnaire. Elles ne sont plus modifiables."}
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
              <Typography variant="h6" className={classes.missionTitle}>
                Mission {entry.name} du {formatDay(entry.startTime)}{" "}
                {companies.length > 1 ? (
                  <span className={classes.companyName}>
                    (entreprise :{" "}
                    {companies.find(c => c.id === entry.companyId).name})
                  </span>
                ) : (
                  ""
                )}
              </Typography>
              {tab === 0 && (
                <LoadingButton
                  aria-label="Valider"
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={async e => {
                    e.stopPropagation();
                    try {
                      for (const entryToValidate1 of entriesToValidateByAdmin.filter(
                        entryToValidate =>
                          entryToValidate.missionId === entry.id
                      )) {
                        const apiResponse = await api.graphQlMutate(
                          VALIDATE_MISSION_MUTATION,
                          {
                            missionId: entry.id,
                            userId: entryToValidate1.user.id
                          }
                        );
                        const validation =
                          apiResponse.data.activities.validateMission;
                        adminStore.dispatch({
                          type: ADMIN_ACTIONS.validateMission,
                          payload: { validation }
                        });
                      }
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
          groupProps: ["name", "startTime", "companyId"]
        }}
        headerClassName={`${classes.header} ${classes.row}`}
      />
    </Paper>
  );
}

const ValidationPanel = withWidth()(_ValidationPanel);

export default ValidationPanel;
