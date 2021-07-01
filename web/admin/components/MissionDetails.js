import React from "react";
import values from "lodash/values";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {
  formatDay,
  formatTimeOfDay,
  formatTimer,
  now,
  prettyFormatDay
} from "common/utils/time";
import Divider from "@material-ui/core/Divider";
import { AugmentedVirtualizedTable, CellContent } from "./AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import { getTime } from "common/utils/events";
import { ACTIVITIES } from "common/utils/activities";
import CheckIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import { DateOrDateTimePicker } from "../../pwa/components/DateOrDateTimePicker";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../utils/store";
import { LoadingButton } from "common/components/LoadingButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { useModals } from "common/utils/modals";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField/TextField";
import List from "@material-ui/core/List";
import { Comment } from "../../common/Comment";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import Button from "@material-ui/core/Button";
import { computeMissionStats } from "../panels/Validations";
import { addBreakOps } from "../../pwa/components/ActivityRevision";
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
import { EXPENDITURES } from "common/utils/expenditures";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

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
    }
  },
  smallTextButton: {
    fontSize: "0.7rem"
  },
  kilometers: {
    paddingTop: theme.spacing(1)
  }
}));

export function MissionDetails({
  missionId,
  mission,
  day,
  handleClose,
  setShouldRefreshActivityPanel
}) {
  const classes = useStyles();

  const adminStore = useAdminStore();
  const api = useApi();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  const [activityIdToEdit, setActivityIdToEdit] = React.useState(null);
  const [
    creatingActivityForUserId,
    setCreatingActivityForUserId
  ] = React.useState(null);
  const [editedValues, setEditedValues] = React.useState({});

  const [errors, setErrors] = React.useState({});

  const ref = React.useRef();

  const [loading, setLoading] = React.useState(false);
  const [missionLoadError, setMissionLoadError] = React.useState(false);

  const [usersToAdd, setUsersToAdd] = React.useState([]);

  async function loadMission() {
    setLoading(true);
    try {
      const missionPayload = await api.graphQlQuery(MISSION_QUERY, {
        id: missionId
      });
      adminStore.setMissions(missions => [
        ...missions,
        {
          ...missionPayload.data.mission,
          companyId: missionPayload.data.mission.company.id
        }
      ]);
    } catch (err) {
      setMissionLoadError(formatApiError(err));
    }
    setLoading(false);
  }

  React.useEffect(() => {
    if (missionId && !mission) {
      loadMission();
    }
  }, [missionId]);

  if (loading) return <CircularProgress color="primary" />;
  if (missionLoadError)
    return <Typography color="error">{missionLoadError}</Typography>;
  if (!mission) return null;

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
      const ops = addBreakOps(
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
      const ops = addBreakOps(
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
      const ops = addBreakOps(
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

  async function onCreateExpenditure(exp, user) {
    if (setShouldRefreshActivityPanel) setShouldRefreshActivityPanel(true);
    const apiResponse = await api.nonConcurrentQueryQueue.execute(() =>
      api.graphQlMutate(LOG_EXPENDITURE_MUTATION, {
        type: exp,
        userId: user.id,
        missionId: mission.id
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
              expenditures: [
                ...m.expenditures.filter(e => e.id !== expenditure.id),
                expenditure
              ]
            }
          : m
      )
    );
  }

  async function onCancelExpenditure(expenditure) {
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
              expenditures: m.expenditures.filter(e => e.id !== expenditure.id)
            }
          : m
      )
    );
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

  const perUserColumns = [
    {
      label: "Activité",
      name: "type",
      format: (type, entry) =>
        !entry.id && creatingActivityForUserId === entry.user.id ? (
          <TextField
            label="Activité"
            required
            fullWidth
            select
            value={editedValues.type}
            onChange={e =>
              setEditedValues({ ...editedValues, type: e.target.value })
            }
          >
            {Object.keys(ACTIVITIES).map(activityName => (
              <MenuItem key={activityName} value={activityName}>
                {ACTIVITIES[activityName].label}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          ACTIVITIES[type].label
        ),
      maxWidth: 185,
      minWidth: 150
    },
    {
      label: "Début",
      name: "startTime",
      format: (time, entry) =>
        activityIdToEdit === entry.id ||
        (!entry.id && creatingActivityForUserId === entry.user.id) ? (
          <DateOrDateTimePicker
            label="Début"
            format="HH:mm"
            autoValidate
            error={errors.startTime}
            maxValue={now()}
            setError={e => setErrors({ ...errors, startTime: e })}
            value={editedValues.startTime}
            setValue={t => setEditedValues({ ...editedValues, startTime: t })}
            required={true}
          />
        ) : (
          formatTimeOfDay(time)
        ),
      edit: true,
      minWidth: 210
    },
    {
      label: "Fin",
      name: "endTime",
      format: (time, entry) =>
        activityIdToEdit === entry.id ||
        (!entry.id && creatingActivityForUserId === entry.user.id) ? (
          <DateOrDateTimePicker
            label="Fin"
            value={editedValues.endTime}
            minValue={editedValues.startTime - 1}
            autoValidate
            maxValue={now()}
            setValue={t => setEditedValues({ ...editedValues, endTime: t })}
            error={errors.endTime}
            setError={e => setErrors({ ...errors, endTime: e })}
            required={true}
            format="HH:mm"
          />
        ) : (
          formatTimeOfDay(time)
        ),
      edit: true,
      minWidth: 210
    },
    {
      label: "Durée",
      name: "duration",
      align: "right",
      format: (duration, entry) => formatTimer(entry.endTime - entry.startTime),
      minWidth: 60
    },
    {
      label: "",
      name: "id",
      format: (id, entry) =>
        activityIdToEdit === id ||
        (!id && creatingActivityForUserId === entry.user.id) ? (
          <>
            <IconButton
              aria-label="Enregistrer modification"
              className="no-margin-no-padding"
              disabled={
                !!errors.startTime ||
                !!errors.endTime ||
                (!activityIdToEdit && !editedValues.type)
              }
              onClick={async () =>
                await alerts.withApiErrorHandling(async () => {
                  activityIdToEdit
                    ? await onEditActivity(
                        entry,
                        { ...editedValues },
                        entry.user,
                        mission.activities
                      )
                    : await onCreateActivity(
                        entry.user,
                        { ...editedValues },
                        mission.activities
                      );
                  setActivityIdToEdit(null);
                  setCreatingActivityForUserId(null);
                  setEditedValues({});
                }, activityIdToEdit || creatingActivityForUserId)
              }
            >
              <CheckIcon fontSize="small" className={classes.saveIcon} />
            </IconButton>
            <IconButton
              aria-label="Annuler modification"
              className="no-margin-no-padding"
              onClick={() => {
                setEditedValues(null);
                setActivityIdToEdit(null);
                setCreatingActivityForUserId(null);
              }}
            >
              <CloseIcon fontSize="small" color="error" />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton
              aria-label="Modifier activité"
              className="no-margin-no-padding"
              color="primary"
              disabled={!!activityIdToEdit || !!creatingActivityForUserId}
              onClick={() => {
                const initialValues = {};
                perUserColumns.forEach(column => {
                  if (column.edit)
                    initialValues[column.name] = entry[column.name];
                });
                setEditedValues(initialValues);
                setErrors({});
                setActivityIdToEdit(entry.id);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Supprimer activité"
              className="no-margin-no-padding"
              disabled={!!activityIdToEdit || !!creatingActivityForUserId}
              onClick={() =>
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
                      activityIdToEdit
                    )
                })
              }
            >
              <DeleteIcon
                color={
                  !activityIdToEdit && !creatingActivityForUserId ? "error" : ""
                }
              />
            </IconButton>
          </>
        ),
      minWidth: 100,
      align: "left"
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
            type: ACTIVITIES.break.name,
            startTime: a.endTime,
            endTime: nextA.startTime,
            duration: nextA.startTime - a.endTime
          });
      }
    });
    return {
      ...stats,
      activities:
        creatingActivityForUserId === stats.user.id
          ? [{ user: stats.user }, ...stats.activities]
          : stats.activities,
      activitiesWithBreaks:
        creatingActivityForUserId === stats.user.id
          ? [{ user: stats.user }, ...activitiesWithBreaks]
          : activitiesWithBreaks
    };
  });

  entries.sort((e1, e2) => e1.user.id - e2.user.id);

  return [
    <Box
      key={0}
      className={`${classes.horizontalPadding} ${classes.missionTitleContainer}`}
    >
      <Typography variant="h3" className={classes.missionTitle}>
        {mission.name ? mission.name : "Mission sans nom"}
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
      {mission.startTime
        ? `${prettyFormatDay(mission.startTime, true)} de (${formatTimeOfDay(
            mission.startTime
          )} à ${formatTimeOfDay(mission.endTime)})`
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
              setUsersToAdd(users => [
                ...users.filter(u => u.id !== user.id),
                user
              ])
          });
        }}
      >
        Ajouter un employé
      </Button>
      <AugmentedVirtualizedTable
        headerHeight={30}
        headerClassName={classes.header}
        columns={perUserColumns}
        entries={entries}
        editable={false}
        rowHeight={(index, userStats) =>
          100 +
          (showExpenditures ? 80 : 0) +
          50 * Object.keys(userStats.activitiesWithBreaks).length
        }
        ref={ref}
        dense
        rowClassName={() => classes.row}
        className={classes.table}
        rowRenderer={({ rowData: userStats, ...props }) => {
          return (
            <Box
              key={props.key}
              className={props.className}
              style={{ ...props.style, display: "block" }}
            >
              <Box style={{ height: 40 }} px={1} className={classes.userRow}>
                <Typography className={classes.userName}>
                  {formatPersonName(userStats.user)}
                </Typography>
                <Button
                  aria-label="Ajouter une activité"
                  color="primary"
                  variant="outlined"
                  size="small"
                  className={classes.smallTextButton}
                  disabled={creatingActivityForUserId || activityIdToEdit}
                  onClick={() => {
                    setCreatingActivityForUserId(userStats.user.id);
                    setEditedValues({
                      startTime: mission.endTime || day,
                      endTime: mission.endTime || day
                    });
                    ref.current.recomputeRowHeights();
                  }}
                >
                  Ajouter une activité
                </Button>
              </Box>
              {userStats.activitiesWithBreaks.map(activity => {
                return (
                  <Box key={activity.id} className={classes.activityRow}>
                    {props.columns.map((column, index) => {
                      const col = perUserColumns[index];
                      return (
                        <Box
                          className={column.props.className}
                          key={column.key}
                          style={column.props.style}
                          role={column.props.role}
                        >
                          <CellContent
                            column={col}
                            cellData={activity[col.name]}
                            rowData={activity}
                            onFocus={false}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
              {showExpenditures && [
                <Typography
                  key={0}
                  className={classes.expenditureTitle}
                  variant="h5"
                  style={{ height: 15, marginTop: 15 }}
                >
                  Frais
                </Typography>,
                <Box
                  key={1}
                  style={{ height: 40, marginTop: 10 }}
                  pl={1}
                  className="flex-row-space-between"
                >
                  <Box className={`flex-row`}>
                    {userStats.expenditureAggs &&
                      Object.keys(userStats.expenditureAggs).map(exp => {
                        const expProps = EXPENDITURES[exp];
                        const expCount = userStats.expenditureAggs[exp];
                        const label =
                          expCount > 1
                            ? `${expCount} ${expProps.plural}`
                            : expProps.label;
                        return <Chip key={exp.type} label={label} />;
                      })}
                  </Box>
                  {userStats.activities.length > 0 && (
                    <Button
                      aria-label="Modifier les frais"
                      color="primary"
                      variant="outlined"
                      size="small"
                      className={classes.smallTextButton}
                      disabled={creatingActivityForUserId || activityIdToEdit}
                      onClick={() => {
                        modals.open("expenditures", {
                          currentExpenditures: userStats.expenditureAggs,
                          title: `Frais pour ${formatPersonName(
                            userStats.user
                          )}`,
                          handleSubmit: exps => {
                            const expendituresToCreate = Object.keys(
                              exps
                            ).filter(
                              e => exps[e] && !userStats.expenditureAggs[e]
                            );
                            const expendituresToDelete = mission.expenditures.filter(
                              e =>
                                e.userId === userStats.user.id && !exps[e.type]
                            );
                            return Promise.all([
                              ...expendituresToDelete.map(e =>
                                alerts.withApiErrorHandling(
                                  () => onCancelExpenditure(e),
                                  e.id
                                )
                              ),
                              ...expendituresToCreate.map(expType =>
                                alerts.withApiErrorHandling(
                                  () =>
                                    onCreateExpenditure(
                                      expType,
                                      userStats.user
                                    ),
                                  expType
                                )
                              )
                            ]);
                          }
                        });
                      }}
                    >
                      Modifier les frais
                    </Button>
                  )}
                </Box>
              ]}
              <Box style={{ height: 40, marginTop: 10 }} pl={1}>
                <Typography
                  className={
                    userStats.validation
                      ? classes.validationTime
                      : classes.nonValidationText
                  }
                >
                  <span style={{ fontStyle: "normal" }}>
                    {userStats.validation ? "✅" : "⚠️"}
                  </span>
                  {userStats.validation
                    ? ` validé le ${formatDay(getTime(userStats.validation))}`
                    : " non validé"}
                </Typography>
              </Box>
            </Box>
          );
        }}
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
          <Comment
            key={comment.id}
            comment={comment}
            withFullDate={true}
            cancelComment={onDeleteComment}
          />
        ))}
      </List>
    </Section>,
    <Section key={5} title="" className={classes.validationSection}>
      <LoadingButton
        aria-label="Valider"
        variant="contained"
        color="primary"
        size="small"
        onClick={async () => {
          try {
            await api.graphQlMutate(VALIDATE_MISSION_MUTATION, {
              missionId: mission.id
            });
            adminStore.setMissions(missions =>
              missions.filter(m => m.id !== mission.id)
            );
            handleClose();
            alerts.success(
              `La mission${
                mission.name ? " " + mission.name : ""
              } a été validée avec succès !`,
              mission.id,
              6000
            );
          } catch (err) {
            alerts.error(formatApiError(err), mission.id, 6000);
          }
        }}
      >
        Valider toute la mission
      </LoadingButton>
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
