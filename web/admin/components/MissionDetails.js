import React from "react";
import values from "lodash/values";
import mapValues from "lodash/mapValues";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import {
  formatDay,
  formatTimeOfDay,
  formatTimer,
  prettyFormatDay
} from "common/utils/time";
import Divider from "@material-ui/core/Divider";
import { AugmentedVirtualizedTable, CellContent } from "./AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import { getTime } from "common/utils/events";
import { ACTIVITIES, TIMEABLE_ACTIVITIES } from "common/utils/activities";
import CheckIcon from "@material-ui/icons/Check";
import EditIcon from "@material-ui/icons/Edit";
import AddIcon from "@material-ui/icons/Add";
import { DateTimePicker } from "../../pwa/components/DateTimePicker";
import {
  CANCEL_ACTIVITY_MUTATION,
  EDIT_ACTIVITY_MUTATION,
  LOG_ACTIVITY_MUTATION,
  useApi,
  VALIDATE_MISSION_MUTATION
} from "common/utils/api";
import { useAdminStore } from "../utils/store";
import { LoadingButton } from "common/components/LoadingButton";
import DeleteIcon from "@material-ui/icons/Delete";
import { useModals } from "common/utils/modals";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField/TextField";

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
    marginBottom: theme.spacing(4)
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
    paddingBottom: theme.spacing(4)
  },
  saveIcon: {
    color: theme.palette.success.main
  },
  header: {
    background: "inherit",
    border: "none"
  },
  userRow: {
    background: "#ebeff3",
    display: "flex",
    justifyContent: "space-between"
  },
  activityRow: {
    borderTop: "1px solid #ebeff3",
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
  }
}));

export function MissionDetails({ mission, handleClose, width }) {
  const classes = useStyles();

  const adminStore = useAdminStore();
  const api = useApi();
  const modals = useModals();

  const [activityIdToEdit, setActivityIdToEdit] = React.useState(null);
  const [
    creatingActivityForUserId,
    setCreatingActivityForUserId
  ] = React.useState(null);
  const [editedValues, setEditedValues] = React.useState({});

  const [errors, setErrors] = React.useState({});

  if (!mission) return null;

  async function onCancelActivity(activity) {
    mission.userStats = mapValues(mission.userStats, us => ({
      ...us,
      activities: us.activities.filter(a => activity.id !== a.id)
    }));
    adminStore.setMissions(missions =>
      missions.map(m => ({
        ...m,
        activities: m.activities.filter(a => activity.id !== a.id)
      }))
    );
    await api.graphQlMutate(CANCEL_ACTIVITY_MUTATION, {
      activityId: activity.id
    });
  }

  async function onCreateActivity(user, newValues) {
    const apiResponse = await api.graphQlMutate(LOG_ACTIVITY_MUTATION, {
      ...newValues,
      missionId: mission.id,
      userId: user.id,
      switch: false
    });
    const activity = apiResponse.data.activities.logActivity;
    mission.userStats = mapValues(mission.userStats, us => ({
      ...us,
      activities:
        us.user.id === user.id
          ? [
              ...us.activities,
              {
                ...activity,
                user
              }
            ].sort((a1, a2) => a1.startTime - a2.startTime)
          : us.activities
    }));
    adminStore.setMissions(missions =>
      missions.map(m => ({
        ...m,
        activities: [...m.activities, { ...activity, user }].sort(
          (a1, a2) => a1.startTime - a2.startTime
        )
      }))
    );
  }

  async function onEditActivity(activity, newValues) {
    mission.userStats = mapValues(mission.userStats, us => ({
      ...us,
      activities: us.activities.map(a =>
        a.id === activity.id
          ? {
              ...a,
              startTime: newValues.startTime,
              endTime: newValues.endTime
            }
          : a
      )
    }));
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
    await api.graphQlMutate(EDIT_ACTIVITY_MUTATION, {
      activityId: activity.id,
      ...newValues
    });
  }

  const perUserColumns = [
    {
      label: "",
      name: "id",
      format: (id, entry) =>
        activityIdToEdit === id ||
        (!id && creatingActivityForUserId === entry.user.id) ? (
          <>
            <IconButton
              className="no-margin-no-padding"
              disabled={!!errors.startTime || !!errors.endTime}
              onClick={() => {
                activityIdToEdit
                  ? onEditActivity(entry, { ...editedValues })
                  : onCreateActivity(entry.user, { ...editedValues });
                setActivityIdToEdit(null);
                setCreatingActivityForUserId({});
                setEditedValues({});
              }}
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
              disabled={!!activityIdToEdit}
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
              disabled={!!activityIdToEdit}
              onClick={() =>
                modals.open("confirmation", {
                  title: "Confirmer suppression de l'activité",
                  handleConfirm: () => onCancelActivity(entry)
                })
              }
            >
              <DeleteIcon color={!activityIdToEdit ? "error" : ""} />
            </IconButton>
          </>
        ),
      minWidth: 55
    },
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
            {Object.keys(TIMEABLE_ACTIVITIES).map(activityName => (
              <MenuItem key={activityName} value={activityName}>
                {TIMEABLE_ACTIVITIES[activityName].label}
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
            disableFuture
            format="HH:mm"
            error={errors.startTime}
            setError={e => setErrors({ ...errors, startTime: e })}
            time={editedValues.startTime}
            setTime={t => setEditedValues({ ...editedValues, startTime: t })}
            required={true}
          />
        ) : (
          formatTimeOfDay(time)
        ),
      edit: true,
      minWidth: 120
    },
    {
      label: "Fin",
      name: "endTime",
      format: (time, entry) =>
        activityIdToEdit === entry.id ||
        (!entry.id && creatingActivityForUserId === entry.user.id) ? (
          <DateTimePicker
            disableFuture
            label="Fin"
            time={editedValues.endTime}
            minTime={editedValues.startTime - 1}
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
      minWidth: 120
    },
    {
      label: "Durée",
      name: "duration",
      align: "right",
      format: (duration, entry) => formatTimer(entry.endTime - entry.startTime),
      minWidth: 60
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
    <Section key={2} title="Détail par employé">
      <AugmentedVirtualizedTable
        headerHeight={30}
        headerClassName={classes.header}
        columns={perUserColumns}
        entries={entries}
        editable={false}
        rowHeight={(index, userStats) =>
          30 + 50 * Object.keys(userStats.activities).length
        }
        dense
        rowClassName={() => classes.row}
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
                <Typography className={classes.validationTime}>
                  <span style={{ fontStyle: "normal" }}>✅</span> validé le{" "}
                  {formatDay(getTime(userStats.validation))}
                </Typography>
              </Box>
              <IconButton
                color="primary"
                variant="contained"
                onClick={() => {
                  setCreatingActivityForUserId(userStats.user.id);
                  setEditedValues({
                    startTime: mission.endTime,
                    endTime: mission.endTime
                  });
                }}
              >
                <AddIcon />
              </IconButton>
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
            </Box>
          );
        }}
      />
    </Section>,
    <Section key={3} title="Observations">
      <Typography>Pas d'observations</Typography>
    </Section>,
    <Section key={4} title="" className={classes.validationSection}>
      <LoadingButton
        variant="contained"
        color="primary"
        size="small"
        onClick={async () => {
          await api.graphQlMutate(VALIDATE_MISSION_MUTATION, {
            missionId: mission.id
          });
          adminStore.setMissions(missions =>
            missions.filter(m => m.id !== mission.id)
          );
          handleClose();
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
        pb={6}
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
