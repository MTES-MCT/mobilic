import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useApi, VALIDATE_MISSION_MUTATION } from "common/utils/api";
import { useAdminStore } from "../utils/store";
import {
  AugmentedVirtualizedTable,
  CellContent
} from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import uniqBy from "lodash/uniqBy";
import min from "lodash/min";
import max from "lodash/max";
import map from "lodash/map";
import sum from "lodash/sum";
import groupBy from "lodash/groupBy";
import mapValues from "lodash/mapValues";
import Paper from "@material-ui/core/Paper";
import { formatDay, formatTimeOfDay, formatTimer } from "common/utils/time";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer/Drawer";
import { MissionDetails } from "../components/MissionDetails";
import { withWidth, isWidthUp } from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

const useStyles = makeStyles(theme => ({
  title: {
    textAlign: "left",
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center"
  },
  container: {
    padding: theme.spacing(2),
    flexShrink: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflowY: "hidden"
  },
  subPanel: {
    padding: theme.spacing(2)
  },
  successText: {
    color: theme.palette.success.main
  },
  warningText: {
    color: theme.palette.warning.main
  },
  virtualizedTableContainer: {
    maxHeight: "100%",
    flexShrink: 1,
    overflowY: "hidden"
  },
  collapseWrapper: {
    maxHeight: "100%"
  },
  missionModal: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  row: {
    borderLeft: "1px solid #c9d3df",
    borderRight: "1px solid #c9d3df",
    borderRadius: 5,
    borderTop: "1px solid #c9d3df"
  },
  tab: {
    maxWidth: "unset"
  },
  tabContainer: {
    marginBottom: theme.spacing(2)
  }
}));

function _ValidationPanel({ containerRef, width }) {
  const api = useApi();
  const adminStore = useAdminStore();

  const classes = useStyles();

  const [tab, setTab] = React.useState(0);

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
      format: formatTimeOfDay,
      minWidth: 80
    },
    {
      label: "Fin",
      name: "endTime",
      align: "left",
      format: (time, entry) =>
        entry.isComplete ? (
          formatTimeOfDay(time)
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
    {
      label: "Frais",
      name: "expenditureAggs",
      format: exps => (exps ? formatExpendituresAsOneString(exps) : null),
      align: "left",
      minWidth: 150,
      overflowTooltip: true
    }
  ];

  const nonValidatedByAdminMissions = adminStore.missions
    .filter(m => !m.validatedByAdmin)
    .map(m => {
      const members = uniqBy(
        m.activities.map(a => a.user),
        u => u.id
      );
      const validatorIds = m.validations.map(v => v.submitterId);
      const validatedByAllMembers = members.every(user =>
        validatorIds.includes(user.id)
      );
      const activitiesByUser = groupBy(m.activities, a => a.user.id);
      const isComplete = m.activities.every(a => !!a.endTime);
      const userStats = mapValues(activitiesByUser, (activities, userId) => {
        const startTime = min(activities.map(a => a.startTime));
        const endTime = max(activities.map(a => a.endTime));
        const totalWorkDuration = sum(
          activities.map(a => a.endTime - a.startTime)
        );
        return {
          activities,
          user: members.find(m => m.id.toString() === userId),
          startTime,
          endTime,
          service: endTime - startTime,
          totalWorkDuration,
          isComplete,
          breakDuration: endTime - startTime - totalWorkDuration,
          expenditureAggs: mapValues(
            groupBy(
              m.expenditures.filter(e => e.userId.toString() === userId),
              e => e.type
            ),
            exps => exps.length
          ),
          validation: m.validations.find(
            v => v.submitterId.toString() === userId
          )
        };
      });
      const startTime = min(m.activities.map(a => a.startTime));
      const endTime = max(m.activities.map(a => a.endTime));
      return {
        ...m,
        startTime,
        endTime,
        validatedByAllMembers,
        userStats
      };
    });

  const missionsValidatedByAllWorkers = nonValidatedByAdminMissions.filter(
    m => m.validatedByAllMembers
  );
  const missionsNotValidatedByAllWorkers = nonValidatedByAdminMissions.filter(
    m => !m.validatedByAllMembers
  );

  const [missionOnFocus, setMissionOnFocus] = React.useState(null);

  return (
    <Paper className={classes.container} variant="outlined">
      <Tabs
        value={tab}
        indicatorColor="primary"
        textColor="primary"
        onChange={(e, newTab) => setTab(newTab)}
        className={classes.tabContainer}
      >
        <Tab
          className={classes.tab}
          label={`A valider (${missionsValidatedByAllWorkers.length})`}
        />
        <Tab
          className={classes.tab}
          label={`En attente de validation par les salariés (${missionsNotValidatedByAllWorkers.length})`}
        />
      </Tabs>
      <AugmentedVirtualizedTable
        columns={commonCols}
        entries={
          tab === 0
            ? missionsValidatedByAllWorkers
            : missionsNotValidatedByAllWorkers
        }
        editable={false}
        rowHeight={(index, mission) =>
          60 + 35 * Object.keys(mission.userStats).length
        }
        maxHeight={"100%"}
        defaultSortBy="startTime"
        defaultSortType="desc"
        className={classes.virtualizedTableContainer}
        onRowClick={
          tab === 0
            ? ({ event, rowData }) => {
                event.preventDefault();
                setMissionOnFocus(
                  nonValidatedByAdminMissions.find(m => m.id === rowData.id)
                );
              }
            : null
        }
        rowRenderer={({ rowData: mission, ...props }) => {
          return (
            <Box
              key={props.key}
              className={props.className}
              style={{ ...props.style, display: "block" }}
              onClick={
                props.onRowClick
                  ? e => props.onRowClick({ event: e, rowData: mission })
                  : null
              }
            >
              <Box
                style={{ height: 60 }}
                px={1}
                className="flex-row-space-between"
              >
                <Typography variant="h6">
                  Mission {mission.name ? mission.name : "sans nom"} du{" "}
                  {formatDay(mission.startTime)}
                </Typography>
                {tab === 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={async e => {
                      e.stopPropagation();
                      adminStore.setMissions(missions =>
                        missions.filter(m => m.id !== mission.id)
                      );
                      await api.graphQlMutate(VALIDATE_MISSION_MUTATION, {
                        missionId: mission.id
                      });
                    }}
                  >
                    Valider
                  </Button>
                )}
              </Box>
              {map(mission.userStats, (stats, userId) => (
                <Box
                  style={{ height: 35 }}
                  key={userId}
                  className="flex-row-center"
                >
                  {props.columns.map((column, index) => {
                    const col = commonCols[index];
                    return (
                      <Box
                        className={column.props.className}
                        key={column.key}
                        style={column.props.style}
                        role={column.props.role}
                      >
                        <CellContent
                          column={col}
                          cellData={stats[col.name]}
                          rowData={stats}
                          onFocus={false}
                        />
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          );
        }}
        selectedRowId={missionOnFocus ? missionOnFocus.id : null}
        rowClassName={() => classes.row}
        headerClassName={classes.row}
      />
      <Drawer
        anchor="right"
        open={!!missionOnFocus}
        onClose={() => {
          setMissionOnFocus(null);
        }}
        className={classes.missionModalContainer}
        PaperProps={{
          className: classes.missionModal,
          style: {
            minWidth: isWidthUp("sm", width) ? 600 : "100vw",
            maxWidth: isWidthUp("md", width) ? 550 : "100vw"
          }
        }}
      >
        <MissionDetails
          mission={missionOnFocus}
          handleClose={() => setMissionOnFocus(null)}
        />
      </Drawer>
    </Paper>
  );
}

export const ValidationPanel = withWidth()(_ValidationPanel);
