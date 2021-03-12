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
import { DateTimePicker } from "../../pwa/components/DateTimePicker";
import {
  CANCEL_ACTIVITY_MUTATION,
  CANCEL_COMMENT_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  LOG_ACTIVITY_MUTATION,
  LOG_COMMENT_MUTATION,
  useApi,
  VALIDATE_MISSION_MUTATION
} from "common/utils/api";
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
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import { computeMissionStats } from "../panels/Validations";
import { activityOverwriteOps } from "../../pwa/components/ActivityRevision";

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
    display: "flex",
    justifyContent: "center"
  },
  userName: {
    fontWeight: "bold"
  },
  validationTime: {
    fontStyle: "italic",
    color: theme.palette.success.main
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
  }
}));

export function MissionDetails({ mission, handleClose, width }) {
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

  if (!mission) return null;

  const withAlerts = (func, key) => async () => {
    try {
      await func();
    } catch (err) {
      alerts.error(formatApiError(err), key, 6000);
    }
  };

  async function onCancelActivity(activity) {
    await api.nonConcurrentQueryQueue.execute(() =>
      api.graphQlMutate(CANCEL_ACTIVITY_MUTATION, {
        activityId: activity.id
      })
    );
    mission.activities = mission.activities.filter(a => a.id !== activity.id);
    Object.assign(mission, computeMissionStats(mission));
    adminStore.setMissions(missions =>
      missions.map(m => ({
        ...m,
        activities: m.activities.filter(a => activity.id !== a.id)
      }))
    );
  }

  async function onCreateActivity(user, newValues, activities) {
    if (newValues.type === ACTIVITIES.break.name) {
      const ops = activityOverwriteOps(
        activities,
        newValues.startTime,
        newValues.endTime,
        user.id
      );
      console.log(activities);
      console.log(user.id);
      console.log(ops);
      return await Promise.all(
        ops.map(op => {
          if (op.operation === "cancel") return onCancelActivity(op.activity);
          if (op.operation === "update")
            return onEditActivity(op.activity, {
              startTime: op.startTime,
              endTime: op.endTime
            });
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
    Object.assign(mission, computeMissionStats(mission));
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
  }

  async function onEditActivity(activity, newValues) {
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
    Object.assign(mission, computeMissionStats(mission));
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
          <DateTimePicker
            label="Début"
            format="HH:mm"
            autoValidate
            error={errors.startTime}
            maxTime={now()}
            setError={e => setErrors({ ...errors, startTime: e })}
            time={editedValues.startTime}
            setTime={t => setEditedValues({ ...editedValues, startTime: t })}
            required={true}
          />
        ) : (
          formatTimeOfDay(time)
        ),
      edit: true,
      minWidth: 190
    },
    {
      label: "Fin",
      name: "endTime",
      format: (time, entry) =>
        activityIdToEdit === entry.id ||
        (!entry.id && creatingActivityForUserId === entry.user.id) ? (
          <DateTimePicker
            label="Fin"
            time={editedValues.endTime}
            minTime={editedValues.startTime - 1}
            autoValidate
            maxTime={now()}
            setTime={t => setEditedValues({ ...editedValues, endTime: t })}
            error={errors.endTime}
            setError={e => setErrors({ ...errors, endTime: e })}
            required={true}
            format="HH:mm"
          />
        ) : (
          formatTimeOfDay(time)
        ),
      edit: true,
      minWidth: 190
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
              className="no-margin-no-padding"
              disabled={
                !!errors.startTime ||
                !!errors.endTime ||
                (!activityIdToEdit && !editedValues.type)
              }
              onClick={withAlerts(async () => {
                activityIdToEdit
                  ? await onEditActivity(entry, { ...editedValues })
                  : await onCreateActivity(
                      entry.user,
                      { ...editedValues },
                      mission.activities
                    );
                setActivityIdToEdit(null);
                setCreatingActivityForUserId(null);
                setEditedValues({});
              }, activityIdToEdit || creatingActivityForUserId)}
            >
              <CheckIcon fontSize="small" className={classes.saveIcon} />
            </IconButton>
            <IconButton
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
              className="no-margin-no-padding"
              disabled={!!activityIdToEdit || !!creatingActivityForUserId}
              onClick={() =>
                modals.open("confirmation", {
                  title: "Confirmer suppression de l'activité",
                  handleConfirm: withAlerts(
                    async () => await onCancelActivity(entry),
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
      minWidth: 55,
      align: "right"
    }
  ];

  const entries = values(mission.userStats).map(stats =>
    creatingActivityForUserId === stats.user.id
      ? { ...stats, activities: [{ user: stats.user }, ...stats.activities] }
      : stats
  );

  return [
    <Box
      key={0}
      className={`${classes.horizontalPadding} ${classes.missionTitleContainer}`}
    >
      <Typography variant="h3" className={classes.missionTitle}>
        {mission.name ? mission.name : "Mission sans nom"}
      </Typography>
      <IconButton className={classes.closeButton} onClick={handleClose}>
        <CloseIcon />
      </IconButton>
    </Box>,
    <Typography
      key={1}
      variant="h6"
      className={`${classes.horizontalPadding} ${classes.missionSubTitle}`}
    >
      {prettyFormatDay(mission.startTime, true)} (de{" "}
      {formatTimeOfDay(mission.startTime)} à {formatTimeOfDay(mission.endTime)})
    </Typography>,
    (mission.endLocation || mission.startLocation) && (
      <Section key={2} title="Lieux de service">
        <List dense>
          <ListItem disableGutters>
            <ListItemIcon>Début</ListItemIcon>
            <ListItemText
              primary={
                mission.startLocation
                  ? formatAddressMainText(mission.startLocation)
                  : null
              }
              secondary={
                mission.startLocation
                  ? formatAddressSubText(mission.startLocation)
                  : null
              }
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon>Fin</ListItemIcon>
            <ListItemText
              primary={
                mission.endLocation
                  ? formatAddressMainText(mission.endLocation)
                  : null
              }
              secondary={
                mission.endLocation
                  ? formatAddressSubText(mission.endLocation)
                  : null
              }
            />
          </ListItem>
        </List>
      </Section>
    ),
    <Section key={3} title="Détail par employé">
      <AugmentedVirtualizedTable
        headerHeight={30}
        headerClassName={classes.header}
        columns={perUserColumns}
        entries={entries}
        editable={false}
        rowHeight={(index, userStats) =>
          90 + 50 * Object.keys(userStats.activities).length
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
              <Box style={{ height: 30 }} px={1} className={classes.userRow}>
                <Typography className={classes.userName}>
                  {formatPersonName(userStats.user)}
                </Typography>
              </Box>
              {userStats.activities.map(activity => {
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
              <Box
                style={{ height: 40, marginTop: 10 }}
                pl={1}
                className="flex-row-space-between"
              >
                <Typography className={classes.validationTime}>
                  <span style={{ fontStyle: "normal" }}>✅</span> validé le{" "}
                  {formatDay(getTime(userStats.validation))}
                </Typography>
                <Button
                  color="primary"
                  variant="outlined"
                  size="small"
                  className={classes.smallTextButton}
                  disabled={creatingActivityForUserId || activityIdToEdit}
                  onClick={() => {
                    setCreatingActivityForUserId(userStats.user.id);
                    setEditedValues({
                      startTime: mission.endTime,
                      endTime: mission.endTime
                    });
                    ref.current.recomputeRowHeights();
                  }}
                >
                  Ajouter une activité
                </Button>
              </Box>
            </Box>
          );
        }}
      />
    </Section>,
    <Section key={4} title="Observations">
      <Button
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
