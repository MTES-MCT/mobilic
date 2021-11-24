import React from "react";
import { useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import flatMap from "lodash/flatMap";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import map from "lodash/map";
import Paper from "@material-ui/core/Paper";
import {
  formatDateTime,
  formatDay,
  formatTimeOfDay,
  formatTimer,
  getStartOfDay,
  now
} from "common/utils/time";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import Button from "@material-ui/core/Button";
import withWidth from "@material-ui/core/withWidth";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { VALIDATE_MISSION_MUTATION } from "common/utils/apiQueries";
import {
  missionsToValidateByAdmin,
  missionsToValidateByWorkers,
  missionsValidatedByAdmin
} from "../selectors/missionSelectors";
import { useStyles } from "../components/styles/ValidationsStyle";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useMissionDrawer } from "../components/MissionDrawer";

function _ValidationPanel() {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();
  const location = useLocation();

  const [tab, setTab] = React.useState(0);
  const [tableEntries, setTableEntries] = React.useState([]);
  const [tableColumns, setTableColumns] = React.useState([]);
  const classes = useStyles({ clickableRow: tab === 0 });

  const [missionIdOnFocus, openMission] = useMissionDrawer();
  const companies = adminStore.companies;

  const ref = React.useRef();

  const showExpenditures = adminStore.companies.some(
    c => c.settings.requireExpenditures
  );

  const now1 = now();

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

  const missionsToTableEntries = missions =>
    flatMap(
      missions?.map(m =>
        map(m.userStats, us => ({
          ...us,
          name: m.name,
          missionStartTime: m.startTime,
          missionId: m.id,
          companyId: m.companyId,
          id: `${m.id}${us.user.id}`,
          adminValidation: m.adminGlobalValidation,
          multipleDays:
            getStartOfDay(m.startTime) !==
            getStartOfDay(m.endTime ? m.endTime - 1 : now1)
        }))
      )
    );

  React.useEffect(() => {
    switch (tab) {
      case 0:
        setTableEntries(
          missionsToTableEntries(missionsToValidateByAdmin(adminStore))
        );
        setTableColumns(commonCols);
        break;
      case 1:
        setTableEntries(
          missionsToTableEntries(missionsToValidateByWorkers(adminStore))
        );
        setTableColumns([...commonCols, validationEmployeeCol]);
        break;
      case 2:
        setTableEntries(
          missionsToTableEntries(missionsValidatedByAdmin(adminStore))
        );
        setTableColumns([...commonCols, validationAdminCol]);
        break;
      default:
        setTableColumns([]);
        setTableEntries([]);
    }
  }, [tab, adminStore.missions]);

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
          setTab(newTab);
        }}
        className={classes.tabContainer}
        variant="scrollable"
      >
        <Tab
          className={classes.tab}
          label={`A valider (${missionsToValidateByAdmin(adminStore)?.length})`}
        />
        <Tab
          className={classes.tab}
          label={`En attente de validation par les salariés (${
            missionsToValidateByWorkers(adminStore)?.length
          })`}
        />
        <Tab
          className={classes.tab}
          label={`Missions validées (${
            missionsValidatedByAdmin(adminStore)?.length
          })`}
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
        onRowGroupClick={
          tab === 0
            ? entry => {
                openMission(entry.id);
              }
            : null
        }
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
                <span className={classes.companyName}>
                  (entreprise :{" "}
                  {companies.find(c => c.id === entry.companyId).name})
                </span>
              </Typography>
              {tab === 0 && (
                <Button
                  aria-label="Valider"
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={async e => {
                    e.stopPropagation();
                    try {
                      const apiResponse = await api.graphQlMutate(
                        VALIDATE_MISSION_MUTATION,
                        {
                          missionId: entry.id
                        }
                      );
                      const validation =
                        apiResponse.data.activities.validateMission;
                      adminStore.dispatch({
                        type: ADMIN_ACTIONS.validateMission,
                        payload: { validation }
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
                </Button>
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
