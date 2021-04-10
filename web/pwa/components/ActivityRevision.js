import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { now } from "common/utils/time";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { ACTIVITIES, SWITCH_ACTIVITIES } from "common/utils/activities";
import { getTime } from "common/utils/events";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import forEach from "lodash/forEach";
import MenuItem from "@material-ui/core/MenuItem";
import { formatPersonName, resolveTeamAt } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { DateTimePicker } from "./DateTimePicker";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Switch from "@material-ui/core/Switch/Switch";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";
import { LoadingButton } from "common/components/LoadingButton";

export function activityOverwriteOps(
  allActivities,
  startTime,
  endTime,
  selfId
) {
  const activities = allActivities.filter(a => a.userId === selfId);

  const activitiesStartedBeforeEndingInBetween = activities.filter(
    a =>
      getTime(a) < startTime &&
      (!endTime || (a.endTime && a.endTime > startTime && a.endTime <= endTime))
  );
  const activitiesPurelyInBetween = activities.filter(
    a =>
      getTime(a) >= startTime &&
      (!endTime || (a.endTime && a.endTime > startTime && a.endTime <= endTime))
  );
  const activitiesStartedInBetweenEndingAfter = activities.filter(
    a =>
      getTime(a) >= startTime &&
      endTime &&
      getTime(a) < endTime &&
      (!a.endTime || a.endTime > endTime)
  );
  const activitiesFullyOverlapping = activities
    .filter(
      a =>
        getTime(a) < startTime && endTime && (!a.endTime || a.endTime > endTime)
    )
    .map(a => {
      let driverId;
      if ([ACTIVITIES.drive.name, ACTIVITIES.support.name].includes(a.type)) {
        const siblingActivities = allActivities.filter(
          a1 =>
            a1.userId !== a.userId &&
            a1.startTime === a.startTime &&
            a1.endTime === a.endTime
        );

        driverId = -1;
        forEach(siblingActivities, a1 => {
          if (a1.type === ACTIVITIES.drive.name) driverId = a1.userId;
          return false;
        });
      }
      return { ...a, driverId };
    });

  let ops = [];
  activitiesStartedBeforeEndingInBetween.forEach(a =>
    ops.push({
      activity: a,
      operation: "update",
      startTime: a.startTime,
      endTime: startTime
    })
  );
  activitiesPurelyInBetween.forEach(a =>
    ops.push({
      activity: a,
      operation: "cancel"
    })
  );
  activitiesStartedInBetweenEndingAfter.forEach(a =>
    ops.push({
      activity: a,
      operation: "update",
      startTime: endTime,
      endTime: a.endTime
    })
  );
  activitiesFullyOverlapping.forEach(a =>
    ops.push(
      {
        activity: a,
        operation: "update",
        startTime: a.startTime,
        endTime: startTime
      },
      {
        operation: "create",
        type: a.type,
        startTime: endTime,
        endTime: a.endTime
      }
    )
  );
  return ops;
}

const useStyles = makeStyles(theme => ({
  formField: {
    marginBottom: theme.spacing(2)
  }
}));

export default function ActivityRevisionOrCreationModal({
  event,
  teamChanges = {},
  otherActivities = [],
  open,
  handleClose,
  handleRevisionAction,
  previousMissionEnd,
  nextMissionStart,
  cancellable,
  nullableEndTime = true,
  createActivity
}) {
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();
  const coworkers = store.getEntity("coworkers");

  const [newActivityType, setNewActivityType] = React.useState("");
  const [newActivityDriverId, setNewActivityDriverId] = React.useState(0);

  const [teamMode, setTeamMode] = React.useState(false);

  const [newUserTime, setNewUserTime] = React.useState(null);
  const [newUserEndTime, setNewUserEndTime] = React.useState(null);
  const [newUserTimeError, setNewUserTimeError] = React.useState("");
  const [newUserEndTimeError, setNewUserEndTimeError] = React.useState("");

  const [userComment, setUserComment] = React.useState("");

  const userId = store.userId();
  const team = newUserTime
    ? uniq([userId, ...resolveTeamAt(teamChanges, newUserTime)])
    : [userId];

  const isCreation = !event;
  const actuallyNullableEndTime =
    nullableEndTime && newActivityType !== ACTIVITIES.break.name;

  function _getOverlappingActivities(userIds) {
    const overlappingActivities = otherActivities.filter(a => {
      if (event && a.id === event.id) return false;
      if (!userIds.includes(a.userId)) return false;
      return (
        (!newUserEndTime || a.startTime < newUserEndTime) &&
        (!a.endTime || a.endTime > newUserTime)
      );
    });
    return {
      start: overlappingActivities.filter(
        a =>
          a.startTime <= newUserTime && (!a.endTime || a.endTime >= newUserTime)
      ),
      end: overlappingActivities.filter(
        a =>
          !(
            a.startTime <= newUserTime &&
            (!a.endTime || a.endTime >= newUserTime)
          )
      )
    };
  }

  async function handleSubmit(actionType) {
    if (actionType === "creation") {
      let driverId = null;
      if (requiresDriver()) driverId = newActivityDriverId;

      if (newActivityType === ACTIVITIES.break.name) {
        const ops = activityOverwriteOps(
          otherActivities,
          newUserTime,
          newUserEndTime,
          userId
        );
        return await Promise.all(
          ops.map(op => {
            if (op.operation === "create")
              return createActivity({
                activityType: op.type,
                startTime: op.startTime,
                endTime: op.endTime,
                driverId: op.driverId,
                userComment,
                team: teamMode
                  ? uniq([userId, ...resolveTeamAt(teamChanges, op.startTime)])
                  : [userId]
              });
            else {
              return handleRevisionAction(
                op.activity,
                op.operation,
                op.startTime,
                op.endTime,
                userComment,
                teamMode
              );
            }
          })
        );
      }

      await createActivity({
        activityType: newActivityType,
        startTime: newUserTime,
        endTime: newUserEndTime,
        driverId: driverId,
        userComment: userComment,
        team: teamMode ? team : [userId]
      });
    } else
      await handleRevisionAction(
        actionType,
        newUserTime,
        newUserEndTime,
        userComment,
        teamMode
      );
  }

  React.useEffect(() => {
    if (event) {
      setNewUserTime(getTime(event));
      setNewUserEndTime(event.endTime);
    } else {
      setNewUserTime(null);
      setNewUserEndTime(null);
    }
    setNewUserEndTimeError("");
    setNewUserTimeError("");
    setNewActivityDriverId(0);
    setNewActivityType("");
    setUserComment("");
    setTeamMode(false);
    return () => {};
  }, [open]);

  React.useEffect(() => {
    if (newUserTime) {
      let hasStartError = false;
      let hasEndError = false;
      if (previousMissionEnd && newUserTime < previousMissionEnd) {
        hasStartError = true;
        setNewUserTimeError(`Chevauchement avec la mission précédente.`);
      } else if (nextMissionStart && newUserTime > nextMissionStart) {
        hasStartError = true;
        setNewUserTimeError(`Chevauchement avec la mission suivante.`);
      } else if (newUserTime > now()) {
        hasStartError = true;
        setNewUserTimeError(`L'heure ne peut pas être dans le futur.`);
      }

      if (newUserEndTime) {
        if (newUserEndTime < newUserTime) {
          hasEndError = true;
          setNewUserEndTimeError("La fin doit être après le début");
        } else if (newUserEndTime > now()) {
          hasEndError = true;
          setNewUserEndTimeError(`L'heure ne peut pas être dans le futur.}`);
        }
      }

      if (!hasStartError && !hasEndError) {
        if (newActivityType === ACTIVITIES.break.name) {
          const userActivities = otherActivities.filter(
            a => a.userId === userId
          );
          const earliestActivityStart = min(
            userActivities.map(a => getTime(a))
          );
          const latestActivityEnd = userActivities.some(a => !a.endTime)
            ? null
            : max(userActivities.map(a => a.endTime));

          if (newUserTime <= earliestActivityStart) {
            hasStartError = true;
            setNewUserTimeError(
              `La journée ne peut pas démarrer par une pause.`
            );
          }
          if (latestActivityEnd && newUserEndTime >= latestActivityEnd) {
            hasEndError = true;
            setNewUserEndTimeError(
              `La journée ne peut pas terminer par une pause.`
            );
          }
        } else {
          const overlappingActivities = _getOverlappingActivities(
            teamMode ? team : [userId]
          );
          if (overlappingActivities.start.length > 0) {
            hasStartError = true;
            if (overlappingActivities.start.some(a => a.userId === userId)) {
              setNewUserTimeError(
                `Conflit avec l'activité ${
                  ACTIVITIES[overlappingActivities.start[0].type].label
                }`
              );
            } else
              setNewUserTimeError(
                `Conflit avec l'activité ${
                  ACTIVITIES[overlappingActivities.start[0].type].label
                } pour les coéquipiers`
              );
          }
          if (overlappingActivities.end.length > 0) {
            hasEndError = true;
            if (overlappingActivities.end.some(a => a.userId === userId)) {
              setNewUserEndTimeError(
                `Conflit avec l'activité ${
                  ACTIVITIES[overlappingActivities.end[0].type].label
                }`
              );
            } else
              setNewUserEndTimeError(
                `Conflit avec l'activité ${
                  ACTIVITIES[overlappingActivities.end[0].type].label
                } pour les coéquipiers`
              );
          }
        }
      }

      if (!hasStartError) setNewUserTimeError("");
      if (!hasEndError) setNewUserEndTimeError("");
    }
  }, [
    newUserTime,
    newUserEndTime,
    newActivityType,
    previousMissionEnd,
    nextMissionStart,
    userId,
    teamMode
  ]);

  function requiresDriver() {
    return (
      isCreation &&
      (newActivityType === ACTIVITIES.drive.name ||
        newActivityType === ACTIVITIES.support.name)
    );
  }

  function canSubmit(actionType) {
    if (actionType === "cancel") {
      return !!event;
    }
    if (actionType === "revision") {
      return (
        event &&
        (getTime(event) !== newUserTime || event.endTime !== newUserEndTime) &&
        !newUserTimeError &&
        !newUserEndTimeError
      );
    }
    if (actionType === "creation") {
      if (requiresDriver()) {
        return (
          !!newActivityType &&
          newActivityType !== "" &&
          !!newUserTime &&
          (actuallyNullableEndTime || !!newUserEndTime) &&
          !newUserTimeError &&
          !newUserEndTimeError &&
          newActivityDriverId !== 0
        );
      }
      return (
        !!newActivityType &&
        newActivityType !== "" &&
        !!newUserTime &&
        (actuallyNullableEndTime || !!newUserEndTime) &&
        !newUserTimeError &&
        !newUserEndTimeError
      );
    }
    return false;
  }

  const classes = useStyles();

  return (
    <Dialog open={open} onClose={handleClose}>
      <CustomDialogTitle
        title={isCreation ? "Nouvelle activité" : "Modifier l'activité"}
        handleClose={handleClose}
      />
      <DialogContent dividers>
        <Box my={2} mb={4}>
          <Typography>
            ⚠️ Les modifications seront visibles par votre employeur et par les
            contrôleurs
          </Typography>
        </Box>
        <Box mt={1}>
          <TextField
            label="Activité"
            required
            fullWidth
            variant={isCreation ? "filled" : "standard"}
            className={classes.formField}
            select
            disabled={!isCreation}
            value={isCreation ? newActivityType : event.type}
            onChange={e => setNewActivityType(e.target.value)}
          >
            {Object.keys(SWITCH_ACTIVITIES).map(activityName => (
              <MenuItem key={activityName} value={activityName}>
                {SWITCH_ACTIVITIES[activityName].label}
              </MenuItem>
            ))}
          </TextField>
          {requiresDriver() && (
            <TextField
              label="Conducteur"
              required
              variant="filled"
              className={classes.formField}
              fullWidth
              select
              value={newActivityDriverId}
              onChange={e => setNewActivityDriverId(e.target.value)}
            >
              {team.map((id, index) => (
                <MenuItem key={index} value={id}>
                  {id === store.userId()
                    ? formatPersonName(store.userInfo())
                    : coworkers[id.toString()]
                    ? formatPersonName(coworkers[id.toString()])
                    : "Inconnu"}
                </MenuItem>
              ))}
              <MenuItem key={-1} value={-1}>
                Une autre personne
              </MenuItem>
            </TextField>
          )}
          <DateTimePicker
            key={0}
            label="Début"
            variant="filled"
            className={classes.formField}
            time={newUserTime}
            setTime={setNewUserTime}
            error={newUserTimeError}
            minTime={previousMissionEnd}
            maxTime={nextMissionStart}
            required
            noValidate
          />
          <DateTimePicker
            key={1}
            label="Fin"
            variant="filled"
            className={classes.formField}
            required={!actuallyNullableEndTime}
            time={newUserEndTime}
            minTime={newUserTime}
            maxTime={nextMissionStart}
            setTime={setNewUserEndTime}
            error={newUserEndTimeError}
            clearable={actuallyNullableEndTime}
            noValidate
          />
        </Box>
        {team.length > 1 && (
          <Box mt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={teamMode}
                  onChange={() => setTeamMode(!teamMode)}
                  color="primary"
                />
              }
              label="Pour toute l'équipe"
              labelPlacement="end"
            />
          </Box>
        )}
        <Box py={4}>
          <TextField
            label="Raison (optionnelle)"
            fullWidth
            variant="filled"
            multiline
            rowsMax={10}
            value={userComment}
            onChange={e => setUserComment(e.target.value)}
          />
        </Box>
      </DialogContent>
      <CustomDialogActions>
        {!isCreation && (
          <Button
            variant="outlined"
            color="primary"
            disabled={!canSubmit("cancel")}
            onClick={() => {
              modals.open("confirmation", {
                title: "Confirmer suppression",
                textButtons: true,
                handleConfirm: async () => {
                  await handleSubmit("cancel");
                  handleClose();
                }
              });
            }}
          >
            Supprimer
          </Button>
        )}
        <LoadingButton
          variant="contained"
          color="primary"
          disabled={!canSubmit(isCreation ? "creation" : "revision")}
          onClick={async () => {
            await handleSubmit(isCreation ? "creation" : "revision");
            handleClose();
          }}
        >
          {isCreation ? "Créer" : "Modifier heure"}
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
