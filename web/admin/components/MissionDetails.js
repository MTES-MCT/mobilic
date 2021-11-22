import React from "react";
import values from "lodash/values";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {
  formatDateTime,
  formatDay,
  formatTimeOfDay,
  formatTimer,
  getStartOfDay,
  now,
  prettyFormatDay
} from "common/utils/time";
import Divider from "@material-ui/core/Divider";
import flatMap from "lodash/flatMap";
import { AugmentedTable } from "./AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import {
  ACTIVITIES,
  convertBreakIntoActivityOperations
} from "common/utils/activities";
import { DateOrDateTimePicker } from "../../pwa/components/DateOrDateTimePicker";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../utils/store";
import { LoadingButton } from "common/components/LoadingButton";
import { useModals } from "common/utils/modals";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField/TextField";
import List from "@material-ui/core/List";
import { Event } from "../../common/Event";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  formatApiError,
  graphQLErrorMatchesCode,
  isGraphQLError
} from "common/utils/errors";
import Button from "@material-ui/core/Button";
import {
  CANCEL_ACTIVITY_MUTATION,
  CANCEL_COMMENT_MUTATION,
  CANCEL_EXPENDITURE_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  LOG_ACTIVITY_MUTATION,
  LOG_COMMENT_MUTATION,
  LOG_EXPENDITURE_MUTATION,
  MISSION_QUERY,
  VALIDATE_MISSION_MUTATION
} from "common/utils/apiQueries";
import LocationEntry from "../../pwa/components/LocationEntry";
import Chip from "@material-ui/core/Chip";
import {
  editUserExpenditures,
  EXPENDITURES,
  regroupExpendituresSpendingDateByType
} from "common/utils/expenditures";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import TableCell from "@material-ui/core/TableCell";
import Switch from "@material-ui/core/Switch/Switch";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import Grid from "@material-ui/core/Grid";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import {
  computeMissionStats,
  missionCreatedByAdmin
} from "common/utils/mission";
import {
  missionsNotValidatedByAllWorkers,
  missionValidatedByAdmin,
  missionWithStats
} from "../selectors/missionSelectors";

const useStyles = makeStyles(theme => ({
  missionTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  closeButton: {
    padding: 0
  },
  missionTitle: {
    textOverflow: "ellipsis",
    marginRight: theme.spacing(4)
  },
  missionOverallTimes: {
    marginTop: theme.spacing(2),
    color: theme.palette.grey[700],
    marginBottom: theme.spacing(4),
    display: "block"
  },
  horizontalPadding: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    textTransform: "uppercase"
  },
  missionSubTitle: {
    fontWeight: 200,
    paddingBottom: theme.spacing(4),
    display: "block"
  },
  saveIcon: {
    color: theme.palette.success.main
  },
  header: {
    background: "inherit",
    border: "none"
  },
  userRow: {
    background: theme.palette.background.default,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  activityRow: {
    borderBottom: "1px solid #ebeff3",
    alignItems: "flex-end",
    height: 50,
    display: "flex"
  },
  expenditureTitle: {
    paddingLeft: theme.spacing(1)
  },
  userName: {
    fontWeight: "bold"
  },
  validationTime: {
    fontStyle: "italic",
    color: theme.palette.success.main
  },
  nonValidationText: {
    fontStyle: "italic",
    color: theme.palette.warning.main
  },
  row: {
    "&:hover": {
      background: "inherit"
    }
  },
  validationSection: {
    textAlign: "center",
    paddingTop: theme.spacing(4)
  },
  comments: {
    paddingLeft: theme.spacing(3)
  },
  table: {
    "& .ReactVirtualized__Grid__innerScrollContainer": {
      borderBottom: "none"
    },
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(6)
  },
  smallTextButton: {
    fontSize: "0.7rem"
  },
  kilometers: {
    paddingTop: theme.spacing(1)
  },
  warningText: {
    color: theme.palette.warning.main
  }
}));

export function MissionDetails({
  missionId,
  day,
  handleClose,
  setShouldRefreshActivityPanel
}) {
  const classes = useStyles();

  const adminStore = useAdminStore();
  const api = useApi();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  const [employeeIdsToInclude, setEmployeeIdsToInclude] = React.useState({});

  const [mission, setMission] = React.useState(null);

  const [errors, setErrors] = React.useState({});

  const ref = React.useRef();

  const [loading, setLoading] = React.useState(false);
  const [missionLoadError, setMissionLoadError] = React.useState(false);

  const [toggleChartView, setToggleChartView] = React.useState(false);

  const [usersToAdd, setUsersToAdd] = React.useState([]);

  async function loadMission() {
    const alreadyFetchedMission = missionWithStats(adminStore)?.find(
      m => m.id === missionId
    );
    if (alreadyFetchedMission) {
      setMission(alreadyFetchedMission);
    } else {
      setLoading(true);
      try {
        const missionPayload = await api.graphQlQuery(MISSION_QUERY, {
          id: missionId
        });
        const apiMission = {
          ...missionPayload.data.mission,
          companyId: missionPayload.data.mission.company.id
        };
        adminStore.setMissions(missions => [...missions, apiMission]);
        setMission(computeMissionStats(apiMission, adminStore.users));
      } catch (err) {
        setMissionLoadError(formatApiError(err));
      }
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (missionId) {
      loadMission();
    }
  }, [missionId]);

  if (loading) return <CircularProgress color="primary" />;
  if (missionLoadError)
    return <Typography color="error">{missionLoadError}</Typography>;
  if (!mission) return null;

  const readOnlyMission =
    missionValidatedByAdmin(mission) ||
    (missionsNotValidatedByAllWorkers(mission) &&
      !missionCreatedByAdmin(mission, adminStore.employments));

  const missionCompany = adminStore.companies.find(
    c => c.id === mission.companyId
  );
  const showExpenditures =
    missionCompany && missionCompany.settings
      ? missionCompany.settings.requireExpenditures
      : false;

  async function onCancelActivity(activity, user, activities) {
    if (setShouldRefreshActivityPanel) setShouldRefreshActivityPanel(true);
    if (activity.type === ACTIVITIES.break.name) {
      const ops = convertBreakIntoActivityOperations(
        activities,
        activity.endTime,
        activity.endTime,
        user.id,
        true
      );
      return await Promise.all(
        ops.map(op => {
          if (op.operation === "cancel")
            return onCancelActivity(op.activity, user);
          if (op.operation === "update")
            return onEditActivity(
              op.activity,
              {
                startTime: op.startTime,
                endTime: op.endTime
              },
              user
            );
          if (op.operation === "create")
            return onCreateActivity(user, {
              type: op.type,
              startTime: op.startTime,
              endTime: op.endTime
            });
        })
      );
    }
    await api.nonConcurrentQueryQueue.execute(() =>
      api.graphQlMutate(CANCEL_ACTIVITY_MUTATION, {
        activityId: activity.id
      })
    );
    mission.activities = mission.activities.filter(a => a.id !== activity.id);
    Object.assign(mission, computeMissionStats(mission, adminStore.users));
    adminStore.setMissions(missions =>
      missions.map(m => ({
        ...m,
        activities: m.activities.filter(a => activity.id !== a.id)
      }))
    );
  }

  async function onCreateActivity(user, newValues, activities) {
    if (setShouldRefreshActivityPanel) setShouldRefreshActivityPanel(true);
    if (newValues.type === ACTIVITIES.break.name) {
      const ops = convertBreakIntoActivityOperations(
        activities,
        newValues.startTime,
        newValues.endTime,
        user.id
      );
      return await Promise.all(
        ops.map(op => {
          if (op.operation === "cancel")
            return onCancelActivity(op.activity, user);
          if (op.operation === "update")
            return onEditActivity(
              op.activity,
              {
                startTime: op.startTime,
                endTime: op.endTime
              },
              user
            );
          if (op.operation === "create")
            return onCreateActivity(user, {
              type: op.type,
              startTime: op.startTime,
              endTime: op.endTime
            });
        })
      );
    }
    const apiResponse = await api.nonConcurrentQueryQueue.execute(() =>
      api.graphQlMutate(LOG_ACTIVITY_MUTATION, {
        ...newValues,
        missionId: mission.id,
        userId: user.id,
        switch: false
      })
    );
    const activity = apiResponse.data.activities.logActivity;
    mission.activities = [...mission.activities, { ...activity, user }];
    Object.assign(mission, computeMissionStats(mission, adminStore.users));
    adminStore.setMissions(missions =>
      missions.map(m =>
        m.id === mission.id
          ? {
              ...m,
              activities: [...m.activities, { ...activity, user }]
            }
          : m
      )
    );
    setUsersToAdd(users => users.filter(u => u.id !== user.id));
  }

  async function onEditActivity(activity, newValues, user, activities) {
    if (setShouldRefreshActivityPanel) setShouldRefreshActivityPanel(true);
    if (activity.type === ACTIVITIES.break.name) {
      const ops = convertBreakIntoActivityOperations(
        activities,
        newValues.startTime,
        newValues.endTime,
        user.id,
        true
      );
      return await Promise.all(
        ops.map(op => {
          if (op.operation === "cancel")
            return onCancelActivity(op.activity, user);
          if (op.operation === "update")
            return onEditActivity(
              op.activity,
              {
                startTime: op.startTime,
                endTime: op.endTime
              },
              user
            );
          if (op.operation === "create")
            return onCreateActivity(user, {
              type: op.type,
              startTime: op.startTime,
              endTime: op.endTime
            });
        })
      );
    }
    await api.nonConcurrentQueryQueue.execute(() =>
      api.graphQlMutate(EDIT_ACTIVITY_MUTATION, {
        activityId: activity.id,
        ...newValues
      })
    );
    mission.activities = mission.activities.map(a =>
      a.id === activity.id
        ? {
            ...a,
            startTime: newValues.startTime,
            endTime: newValues.endTime
          }
        : a
    );
    Object.assign(mission, computeMissionStats(mission, adminStore.users));
    adminStore.setMissions(missions =>
      missions.map(m => ({
        ...m,
        activities: m.activities.map(a =>
          a.id === activity.id
            ? {
                ...a,
                startTime: newValues.startTime,
                endTime: newValues.endTime
              }
            : a
        )
      }))
    );
  }

  async function createExpenditure({ type, spendingDate, userId = null }) {
    return await alerts.withApiErrorHandling(async () => {
      if (setShouldRefreshActivityPanel) setShouldRefreshActivityPanel(true);
      const apiResponse = await api.nonConcurrentQueryQueue.execute(() =>
        api.graphQlMutate(LOG_EXPENDITURE_MUTATION, {
          type,
          userId,
          missionId: mission.id,
          spendingDate: spendingDate
        })
      );
      const expenditure = apiResponse.data.activities.logExpenditure;
      mission.expenditures.push(expenditure);
      Object.assign(mission, computeMissionStats(mission, adminStore.users));
      adminStore.setMissions(missions =>
        missions.map(m =>
          m.id === mission.id
            ? {
                ...m,
                expenditures: mission.expenditures
              }
            : m
        )
      );
    }, type);
  }

  async function cancelExpenditure({ expenditure }) {
    return await alerts.withApiErrorHandling(async () => {
      if (setShouldRefreshActivityPanel) setShouldRefreshActivityPanel(true);
      await api.nonConcurrentQueryQueue.execute(() =>
        api.graphQlMutate(CANCEL_EXPENDITURE_MUTATION, {
          expenditureId: expenditure.id
        })
      );
      mission.expenditures = mission.expenditures.filter(
        e => e.id !== expenditure.id
      );
      Object.assign(mission, computeMissionStats(mission, adminStore.users));
      adminStore.setMissions(missions =>
        missions.map(m =>
          m.id === mission.id
            ? {
                ...m,
                expenditures: m.expenditures.filter(
                  e => e.id !== expenditure.id
                )
              }
            : m
        )
      );
    }, expenditure.id);
  }

  async function onCreateComment(text) {
    const apiResponse = await api.graphQlMutate(LOG_COMMENT_MUTATION, {
      text,
      missionId: mission.id
    });
    const comment = apiResponse.data.activities.logComment;
    mission.comments = [...mission.comments, comment];

    adminStore.setMissions(missions =>
      missions.map(m =>
        m.id === mission.id
          ? {
              ...m,
              comments: [...m.comments, comment]
            }
          : m
      )
    );
  }

  async function onDeleteComment(comment) {
    await api.graphQlMutate(CANCEL_COMMENT_MUTATION, {
      commentId: comment.id
    });
    mission.comments = mission.comments.filter(c => c.id !== comment.id);

    adminStore.setMissions(missions =>
      missions.map(m =>
        m.id === mission.id
          ? {
              ...m,
              comments: m.comments.filter(c => c.id !== comment.id)
            }
          : m
      )
    );
  }

  const doesMissionSpanOnMultipleDays =
    mission.startTime &&
    mission.endTime &&
    getStartOfDay(mission.startTime) !== getStartOfDay(mission.endTime - 1);
  const dateTimeFormatter = doesMissionSpanOnMultipleDays
    ? formatDateTime
    : formatTimeOfDay;

  const perUserColumns = [
    {
      label: "Activité",
      name: "type",
      create: true,
      format: (type, entry) => ACTIVITIES[type].label,
      renderEditMode: (type, entry, setType) => (
        <TextField
          label="Activité"
          required
          fullWidth
          select
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {Object.keys(ACTIVITIES).map(activityName => (
            <MenuItem key={activityName} value={activityName}>
              {ACTIVITIES[activityName].label}
            </MenuItem>
          ))}
        </TextField>
      ),
      maxWidth: 185,
      minWidth: 150
    },
    {
      label: "Début",
      name: "startTime",
      format: (time, entry) => dateTimeFormatter(time),
      renderEditMode: (time, entry, setTime) => (
        <DateOrDateTimePicker
          label="Début"
          format="HH:mm"
          autoValidate
          error={errors.startTime}
          maxValue={now()}
          setError={e => setErrors({ ...errors, startTime: e })}
          value={time}
          setValue={setTime}
          required={true}
        />
      ),
      edit: true,
      minWidth: 210
    },
    {
      label: "Fin",
      name: "endTime",
      format: (time, entry) =>
        time ? (
          dateTimeFormatter(time)
        ) : (
          <span className={classes.warningText}>
            <strong>En cours</strong>
          </span>
        ),
      renderEditMode: (time, entry, setTime) => (
        <DateOrDateTimePicker
          label="Fin"
          value={time}
          minValue={entry.startTime + 1}
          autoValidate
          maxValue={now()}
          setValue={setTime}
          error={errors.endTime}
          setError={e => setErrors({ ...errors, endTime: e })}
          required={true}
          format="HH:mm"
        />
      ),
      edit: true,
      minWidth: 210
    },
    {
      label: "Durée",
      name: "duration",
      align: "right",
      format: (duration, entry) =>
        formatTimer((entry.endTime || now()) - entry.startTime),
      minWidth: 60
    }
  ];

  let entries = values(mission.userStats);
  const userIdsWithEntries = entries.map(e => e.user.id);
  usersToAdd.forEach(user => {
    if (!userIdsWithEntries.includes(user.id)) {
      entries.push({
        user,
        activities: [],
        activitiesWithBreaks: [],
        expenditureAggs: {}
      });
    }
  });

  entries = entries.map(stats => {
    const activitiesWithBreaks = [];
    stats.activities.forEach((a, index) => {
      activitiesWithBreaks.push(a);
      if (index < stats.activities.length - 1) {
        const nextA = stats.activities[index + 1];
        if (a.endTime < nextA.startTime)
          activitiesWithBreaks.push({
            id: "break" + index,
            user: stats.user,
            userId: stats.user.id,
            type: ACTIVITIES.break.name,
            startTime: a.endTime,
            endTime: nextA.startTime
          });
      }
    });
    return {
      ...stats,
      activitiesWithBreaks: activitiesWithBreaks.map(a => ({
        ...a,
        duration: a.endTime - a.startTime
      }))
    };
  });

  entries.sort((e1, e2) => e1.user.id - e2.user.id);

  return [
    <Box
      key={0}
      className={`${classes.horizontalPadding} ${classes.missionTitleContainer}`}
    >
      <Typography variant="h3" className={classes.missionTitle}>
        {mission.name ||
          (mission.startTime
            ? `Mission du ${prettyFormatDay(mission.startTime, false)}`
            : "Détails de la mission")}
      </Typography>
      <IconButton
        aria-label="Fermer"
        className={classes.closeButton}
        onClick={handleClose}
      >
        <CloseIcon />
      </IconButton>
    </Box>,
    <Typography
      key={1}
      variant="h6"
      className={`${classes.horizontalPadding} ${classes.missionSubTitle}`}
    >
      {doesMissionSpanOnMultipleDays
        ? `Du ${dateTimeFormatter(mission.startTime)} au ${dateTimeFormatter(
            mission.endTime
          )}`
        : mission.startTime
        ? `${
            !mission.name ? prettyFormatDay(mission.startTime, true) : ""
          } de ${dateTimeFormatter(mission.startTime)} à ${dateTimeFormatter(
            mission.endTime
          )}`
        : day
        ? prettyFormatDay(day, true)
        : ""}
    </Typography>,
    (mission.endLocation || mission.startLocation) && (
      <Section key={2} title="Lieux de service">
        <List dense>
          <LocationEntry
            mission={mission}
            location={mission.startLocation}
            isStart={true}
          />
          <LocationEntry
            mission={mission}
            location={mission.endLocation}
            isStart={false}
          />
        </List>
        {mission.startLocation &&
          mission.startLocation.kilometerReading &&
          mission.endLocation &&
          mission.endLocation.kilometerReading &&
          mission.endLocation.kilometerReading >=
            mission.startLocation.kilometerReading && (
            <Typography className={classes.kilometers}>
              Distance parcourue :{" "}
              {mission.endLocation.kilometerReading -
                mission.startLocation.kilometerReading}{" "}
              km
            </Typography>
          )}
      </Section>
    ),
    <Section key={3} title="Détail par employé">
      {!readOnlyMission && (
        <Button
          aria-label="Ajouter un employé"
          color="primary"
          variant="outlined"
          size="small"
          style={{ float: "right" }}
          className={classes.smallTextButton}
          onClick={() => {
            modals.open("selectEmployee", {
              users: adminStore.users.filter(
                u => u.companyId === mission.companyId
              ),
              handleSelect: user =>
                setEmployeeIdsToInclude(users => ({
                  ...users,
                  [user.id]: {
                    user,
                    userId: user.id,
                    startTime: mission.endTime || day,
                    endTime: mission.endTime || day
                  }
                }))
            });
          }}
        >
          Ajouter un employé
        </Button>
      )}
      <Box py={2} className="flex-row" style={{ alignItems: "center" }}>
        <Typography variant="body2">Liste</Typography>
        <Switch
          checked={toggleChartView}
          onChange={e => setToggleChartView(e.target.checked)}
        />
        <Typography variant="body2">Graphiques</Typography>
      </Box>
      <AugmentedTable
        headerHeight={30}
        headerClassName={classes.header}
        columns={perUserColumns}
        entries={flatMap(
          entries.map(e => {
            const rows = [];
            if (toggleChartView) {
              rows.push({
                chart: true,
                id: `chart_${e.user.id}`,
                user: e.user,
                userId: e.user.id,
                activitiesWithBreaks: e.activitiesWithBreaks
              });
            } else rows.push(...e.activitiesWithBreaks);
            rows.push({
              id: `expenditures_${e.user.id}`,
              user: e.user,
              userId: e.user.id,
              activities: e.activities,
              expenditures: e.expenditures,
              expenditureAggs: e.expenditureAggs,
              validation: e.validation,
              lastRow: true
            });
            return rows;
          })
        )}
        renderRow={({
          entry,
          renderColumn,
          columns,
          startRowEdit,
          terminateRowEdit
        }) => {
          if (entry.chart) {
            return (
              <>
                {renderColumn(columns[0])}
                <TableCell colSpan={100} align="center">
                  <Grid container alignItems="stretch" justify="center">
                    <Grid item>
                      <Typography variant="h6">Frise temporelle</Typography>
                      <VerticalTimeline
                        width={300}
                        activities={entry.activitiesWithBreaks}
                        datetimeFormatter={formatTimeOfDay}
                      />
                    </Grid>
                    <Grid item>
                      <Typography variant="h6">Répartition</Typography>
                      <ActivitiesPieChart
                        minWidth={300}
                        maxWidth={300}
                        activities={entry.activitiesWithBreaks}
                      />
                    </Grid>
                  </Grid>
                </TableCell>
              </>
            );
          }
          if (entry.lastRow) {
            return (
              <>
                {renderColumn(columns[0])}
                <TableCell colSpan={100}>
                  {showExpenditures && [
                    <Box key={1} className="flex-row-space-between">
                      <Box className="flex-row-center" py={1}>
                        <Typography key={0} variant="h5">
                          Frais :
                        </Typography>
                        <Box className={`flex-row`} px={2}>
                          {entry.expenditureAggs &&
                            Object.keys(entry.expenditureAggs).map(exp => {
                              const expProps = EXPENDITURES[exp];
                              const expCount = entry.expenditureAggs[exp];
                              const label =
                                expCount > 1
                                  ? `${expCount} ${expProps.plural}`
                                  : expProps.label;
                              return (
                                <Chip
                                  size="small"
                                  key={exp.type}
                                  label={label}
                                />
                              );
                            })}
                        </Box>
                      </Box>
                      {entry.activities.length > 0 && !readOnlyMission && (
                        <Button
                          aria-label="Modifier les frais"
                          color="primary"
                          size="small"
                          className={classes.smallTextButton}
                          onClick={() => {
                            startRowEdit();
                            modals.open("expenditures", {
                              currentExpenditures: regroupExpendituresSpendingDateByType(
                                entry.expenditures
                              ),
                              title: `Frais pour ${formatPersonName(
                                entry.user
                              )}`,
                              missionStartTime: mission.startTime,
                              missionEndTime: mission.endTime,
                              handleSubmit: exps => {
                                return editUserExpenditures(
                                  exps,
                                  entry.expenditures,
                                  mission.id,
                                  createExpenditure,
                                  cancelExpenditure,
                                  entry.user?.id
                                ).then(() => {
                                  setTimeout(terminateRowEdit, 300);
                                });
                              }
                            });
                          }}
                        >
                          Modifier les frais
                        </Button>
                      )}
                    </Box>
                  ]}
                  <Box>
                    <Typography
                      className={
                        entry.validation
                          ? classes.validationTime
                          : classes.nonValidationText
                      }
                    >
                      <span style={{ fontStyle: "normal" }}>
                        {entry.validation ? "✅" : "⚠️"}
                      </span>
                      {entry.validation
                        ? ` validé le ${formatDay(
                            entry.validation.receptionTime,
                            true
                          )}`
                        : " non validé"}
                    </Typography>
                  </Box>
                </TableCell>
              </>
            );
          }
        }}
        ref={ref}
        rowClassName={() => classes.row}
        className={classes.table}
        alwaysSortBy={[
          ["userId", "desc"],
          ["lastRow", "desc"]
        ]}
        groupByColumn={{
          name: "userId",
          groupProps: ["user"],
          format: (value, entry) => (
            <Box className="flex-row-space-between">
              <Typography variant="h6" className={classes.missionTitle}>
                {formatPersonName(entry.user)}
              </Typography>
              {!readOnlyMission && (
                <Button
                  aria-label="Ajouter une activité"
                  color="primary"
                  size="small"
                  className={classes.smallTextButton}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    ref.current.newRow({
                      user: entry.user,
                      userId: entry.user.id,
                      startTime: mission.endTime || day,
                      endTime: mission.endTime || day
                    });
                  }}
                >
                  Ajouter une activité
                </Button>
              )}
            </Box>
          )
        }}
        onRowAdd={async entry =>
          await alerts.withApiErrorHandling(async () => {
            await onCreateActivity(entry.user, entry, mission.activities);
          })
        }
        onRowEdit={
          !readOnlyMission
            ? async (entry, newValues) =>
                await alerts.withApiErrorHandling(async () => {
                  await onEditActivity(
                    entry,
                    newValues,
                    entry.user,
                    mission.activities
                  );
                })
            : undefined
        }
        onRowDelete={
          !readOnlyMission
            ? entry =>
                modals.open("confirmation", {
                  title: "Confirmer suppression de l'activité",
                  handleConfirm: () =>
                    alerts.withApiErrorHandling(
                      async () =>
                        await onCancelActivity(
                          entry,
                          entry.user,
                          mission.activities
                        ),
                      entry.id
                    )
                })
            : undefined
        }
        validateRow={entry =>
          !errors.startTime && !errors.endTime && entry.type
        }
        interGroupRowHeight={30}
        groupKeysToShow={employeeIdsToInclude}
      />
    </Section>,
    <Section key={4} title="Observations">
      <Button
        aria-label="Ajouter une observation"
        color="primary"
        variant="outlined"
        size="small"
        style={{ float: "right" }}
        className={classes.smallTextButton}
        onClick={() => {
          modals.open("commentInput", {
            handleContinue: onCreateComment
          });
        }}
      >
        Ajouter une observation
      </Button>
      <List className={classes.comments}>
        {mission.comments.map(comment => (
          <Event
            key={comment.id}
            text={comment.text}
            time={comment.receptionTime}
            submitter={comment.submitter}
            submitterId={comment.submitterId}
            withFullDate={true}
            cancel={onDeleteComment ? () => onDeleteComment(comment) : null}
          />
        ))}
      </List>
    </Section>,
    <Section key={5} title="" className={classes.validationSection}>
      {!readOnlyMission && (
        <LoadingButton
          aria-label="Valider"
          variant="contained"
          color="primary"
          size="small"
          onClick={async () => {
            let errorToDisplay = null;
            try {
              const apiResponse = await api.graphQlMutate(
                VALIDATE_MISSION_MUTATION,
                {
                  missionId: mission.id
                }
              );
              const validation = apiResponse.data.activities.validateMission;
              adminStore.saveMissionValidation(validation);
              handleClose();
            } catch (err) {
              if (
                !(
                  isGraphQLError(err) &&
                  err.graphQLErrors.every(e =>
                    graphQLErrorMatchesCode(e, "NO_ACTIVITIES_TO_VALIDATE")
                  )
                )
              )
                errorToDisplay = formatApiError(err);
            }
            if (errorToDisplay) alerts.error(errorToDisplay, mission.id, 6000);
            else
              alerts.success(
                `La mission ${mission.name} a été validée avec succès !`,
                mission.id,
                6000
              );
          }}
        >
          Valider toute la mission
        </LoadingButton>
      )}
    </Section>
  ];
}

function Section({ className, children, title }) {
  const classes = useStyles();

  return (
    <>
      <Divider />
      <Box
        pt={1}
        pb={2}
        className={`${classes.horizontalPadding} ${className}`}
      >
        <Typography variant="overline" className={classes.sectionTitle}>
          {title}
        </Typography>
        {children}
      </Box>
    </>
  );
}
