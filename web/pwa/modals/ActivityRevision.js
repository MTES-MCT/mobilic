import React from "react";
import Box from "@mui/material/Box";
import { MINUTE, now, sameMinute, truncateMinute } from "common/utils/time";
import TextField from "common/utils/TextField";
import {
  ACTIVITIES,
  ACTIVITIES_OPERATIONS,
  convertNewActivityIntoActivityOperations
} from "common/utils/activities";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import MenuItem from "@mui/material/MenuItem";
import { formatPersonName, resolveTeamAt } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { useModals } from "common/utils/modals";
import { LoadingButton } from "common/components/LoadingButton";
import _ from "lodash";
import { VIRTUAL_ACTIVITIES_ACTIONS } from "../../admin/store/store";
import { NativeDateTimePicker } from "../../common/NativeDateTimePicker";
import OverlappedActivityList from "../components/ActivityRevision/OverlappedActivityList";
import Modal from "../../common/Modal";
import { MandatoryField } from "../../common/MandatoryField";
import Notice from "../../common/Notice";

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
  allowTeamMode = false,
  nullableEndTime = true,
  allowSupportActivity = true,
  allowTransfers = false,
  createActivity,
  handleSeveralActions,
  adminMode = false,
  defaultTime = null,
  forcedUser = null,
  displayWarningMessage = true,
  handleCancelMission = null
}) {
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();
  const coworkers = store.getEntity("coworkers");

  const [newActivityType, setNewActivityType] = React.useState("");
  const [newActivityDriverId, setNewActivityDriverId] = React.useState(0);

  const [teamMode, setTeamMode] = React.useState(allowTeamMode);

  const [newUserTime, setNewUserTime] = React.useState(null);
  const [newUserEndTime, setNewUserEndTime] = React.useState(null);
  const [newUserTimeError, setNewUserTimeError] = React.useState("");
  const [newUserEndTimeError, setNewUserEndTimeError] = React.useState("");

  const [userComment, setUserComment] = React.useState("");

  const userId = forcedUser?.id || store.userId();
  const otherUserActivities = otherActivities.filter(
    act => act.userId === userId
  );
  const team = newUserTime
    ? uniq([userId, ...resolveTeamAt(teamChanges, newUserTime)])
    : [userId];

  const isCreation = !event;
  const actuallyNullableEndTime =
    nullableEndTime && newActivityType !== ACTIVITIES.break.name;

  const activityType = event ? event.type : newActivityType;

  async function changeActivities(sideEffectOperations, actionType) {
    adminMode
      ? await changeActivitiesAdmin(sideEffectOperations, actionType)
      : await changeActivitiesEmployee(sideEffectOperations, actionType);
  }

  async function changeActivitiesEmployee(sideEffectOperations, actionType) {
    await Promise.all(
      sideEffectOperations.map(op => {
        if (op.operation === ACTIVITIES_OPERATIONS.create) {
          return createActivity({
            activityType: op.type,
            startTime: op.startTime,
            endTime: op.endTime,
            driverId: op.driverId,
            userComment,
            team:
              teamMode && team.length > 1
                ? uniq([userId, ...resolveTeamAt(teamChanges, op.startTime)])
                : [userId]
          });
        } else {
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
    if (activityType !== ACTIVITIES.break.name) {
      if (actionType === ACTIVITIES_OPERATIONS.create) {
        let driverId = null;
        if (requiresDriver()) driverId = newActivityDriverId;
        await createActivity({
          activityType: newActivityType,
          startTime: newUserTime,
          endTime: newUserEndTime,
          driverId: driverId,
          userComment: userComment,
          team: teamMode && team.length > 1 ? team : [userId]
        });
      } else {
        await handleRevisionAction(
          event,
          actionType,
          newUserTime,
          newUserEndTime,
          userComment,
          teamMode
        );
      }
    }
  }

  async function changeActivitiesAdmin(sideEffectOperations, actionType) {
    const actionsToDo = sideEffectOperations.map(op => {
      if (op.operation === ACTIVITIES_OPERATIONS.create) {
        return {
          type: VIRTUAL_ACTIVITIES_ACTIONS.create,
          payload: {
            activityType: op.type,
            startTime: op.startTime,
            endTime: op.endTime,
            driverId: op.driverId,
            userComment,
            team:
              teamMode && team.length > 1
                ? uniq([userId, ...resolveTeamAt(teamChanges, op.startTime)])
                : [userId],
            user: forcedUser
          }
        };
      } else {
        return {
          type: VIRTUAL_ACTIVITIES_ACTIONS.edit,
          payload: {
            activity: op.activity,
            actionType: op.operation,
            newStartTime: op.startTime,
            newEndTime: op.endTime,
            userComment,
            teamMode: teamMode && team.length > 1
          }
        };
      }
    });

    if (activityType !== ACTIVITIES.break.name) {
      if (actionType === ACTIVITIES_OPERATIONS.create) {
        let driverId = null;
        if (requiresDriver()) driverId = newActivityDriverId;
        actionsToDo.push({
          type: VIRTUAL_ACTIVITIES_ACTIONS.create,
          payload: {
            activityType: newActivityType,
            startTime: newUserTime,
            endTime: newUserEndTime,
            driverId: driverId,
            userComment: userComment,
            team: teamMode ? team : [userId],
            user: forcedUser
          }
        });
      } else {
        actionsToDo.push({
          type: VIRTUAL_ACTIVITIES_ACTIONS.edit,
          payload: {
            activity: event,
            actionType,
            newStartTime: newUserTime,
            newEndTime: newUserEndTime,
            userComment,
            teamMode: teamMode && team.length > 1
          }
        });
      }
    }
    await handleSeveralActions(actionsToDo);
  }

  async function handleSubmit(actionType) {
    const ops = convertNewActivityIntoActivityOperations(
      otherActivities,
      actionType === ACTIVITIES_OPERATIONS.cancel ? event.endTime : newUserTime,
      actionType === ACTIVITIES_OPERATIONS.cancel
        ? event.endTime
        : newUserEndTime,
      userId,
      activityType === ACTIVITIES.break.name
    );

    if (ops.length > 0) {
      modals.open("confirmation", {
        title: "Confirmer la modification d'autres activités",
        textButtons: true,
        confirmButtonLabel: "OK",
        cancelButtonLabel: "Annuler",
        content: <OverlappedActivityList activitiesOperations={ops} />,
        handleConfirm: async () => {
          await changeActivities(ops, actionType);
          handleClose();
        }
      });
    } else {
      await changeActivities(ops, actionType);
      handleClose();
    }
  }

  React.useEffect(() => {
    if (event) {
      setNewUserTime(event.startTime);
      if (!event.endTime && !actuallyNullableEndTime) {
        setNewUserEndTime(presetNewEndTime(event.startTime));
      } else {
        setNewUserEndTime(event.endTime);
      }
    } else {
      setNewUserTime(defaultTime);
      setNewUserEndTime(presetNewEndTime(defaultTime));
    }
    setNewUserEndTimeError("");
    setNewUserTimeError("");
    setNewActivityDriverId(0);
    setNewActivityType("");
    setUserComment("");
    setTeamMode(allowTeamMode);
    return () => {};
  }, [open]);

  const presetNewEndTime = startTime => {
    const dateNow = now();
    if (startTime) {
      const halfHourAfterStartTime = startTime + 30 * MINUTE;
      if (halfHourAfterStartTime < dateNow) {
        return halfHourAfterStartTime;
      }
    }
    return null;
  };

  React.useEffect(() => {
    if (newUserTime) {
      let hasStartError = false;
      let hasEndError = false;
      if (previousMissionEnd && newUserTime < previousMissionEnd) {
        hasStartError = true;
        setNewUserTimeError(`Chevauchement avec la mission précédente.`);
      } else if (newUserTime > now()) {
        hasStartError = true;
        setNewUserTimeError(`L'heure ne peut pas être dans le futur.`);
      }

      if (newUserEndTime) {
        if (
          newUserEndTime <= newUserTime ||
          sameMinute(newUserEndTime, newUserTime)
        ) {
          hasEndError = true;
          setNewUserEndTimeError("La fin doit être après le début");
        } else if (newUserEndTime > now()) {
          hasEndError = true;
          setNewUserEndTimeError(`L'heure ne peut pas être dans le futur.`);
        }
      }

      if (!hasStartError && !hasEndError) {
        if (activityType === ACTIVITIES.break.name) {
          const earliestActivityStart = min(
            otherUserActivities.map(a => a.startTime)
          );
          const latestActivityEnd = otherUserActivities.some(a => !a.endTime)
            ? null
            : max(otherUserActivities.map(a => a.endTime));

          if (newUserTime <= earliestActivityStart) {
            hasStartError = true;
            setNewUserTimeError(
              `La journée ne peut pas démarrer par une pause.`
            );
          }
          if (latestActivityEnd && newUserEndTime >= latestActivityEnd) {
            hasEndError = true;
            setNewUserEndTimeError(
              `La journée ne peut pas se terminer par une pause.`
            );
          }
        }
      }

      if (!hasStartError) setNewUserTimeError("");
      if (!hasEndError) setNewUserEndTimeError("");
    }
  }, [newUserTime, newUserEndTime, activityType, previousMissionEnd, userId]);

  function requiresDriver() {
    return (
      isCreation &&
      (newActivityType === ACTIVITIES.drive.name ||
        newActivityType === ACTIVITIES.support.name) &&
      (allowSupportActivity || (teamMode && team.length > 1))
    );
  }

  function canSubmit(actionType) {
    if (actionType === ACTIVITIES_OPERATIONS.cancel) {
      return !!event && activityType !== ACTIVITIES.break.name;
    }
    if (actionType === ACTIVITIES_OPERATIONS.update) {
      return (
        event &&
        (event.startTime !== newUserTime || event.endTime !== newUserEndTime) &&
        !newUserTimeError &&
        !newUserEndTimeError
      );
    }
    if (actionType === ACTIVITIES_OPERATIONS.create) {
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

  const filterOutSupport = activity =>
    allowSupportActivity ? true : activity !== ACTIVITIES.support.name;
  const filterOutTransfer = activity =>
    allowTransfers ? true : activity !== ACTIVITIES.transfer.name;

  const filteredActivities = () => {
    return Object.keys(ACTIVITIES).filter(
      a =>
        filterOutSupport(a) && filterOutTransfer(a) && a !== ACTIVITIES.off.name
    );
  };

  const classes = useStyles();

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={isCreation ? "Nouvelle activité" : "Modifier l'activité"}
      content={
        <>
          {displayWarningMessage && (
            <Notice
              description="Les modifications seront visibles par votre employeur et par les
                contrôleurs (en cas de contrôle en bord de route ou en
                entreprise)"
              type="warning"
              sx={{ marginTop: 2, marginBottom: 4 }}
            />
          )}
          <MandatoryField />
          <Box mt={1}>
            <TextField
              label="Activité"
              required
              fullWidth
              variant="filled"
              className={classes.formField}
              select
              disabled={!isCreation}
              value={isCreation ? newActivityType : event.type}
              onChange={e => setNewActivityType(e.target.value)}
            >
              {filteredActivities().map(activityName => (
                <MenuItem
                  disabled={activityName === ACTIVITIES.support.name}
                  key={activityName}
                  value={activityName}
                >
                  {ACTIVITIES[activityName].label}
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
            <NativeDateTimePicker
              key={0}
              label="Début"
              value={newUserTime}
              setValue={_.flow([truncateMinute, setNewUserTime])}
              minDateTime={previousMissionEnd}
              maxDateTime={now()}
              fullWidth
              required
              className={classes.formField}
              variant="filled"
              error={newUserTimeError}
            />
            <NativeDateTimePicker
              key={1}
              label="Fin"
              value={newUserEndTime}
              setValue={_.flow([truncateMinute, setNewUserEndTime])}
              minDateTime={newUserTime}
              maxDateTime={now()}
              required={!actuallyNullableEndTime}
              className={classes.formField}
              variant="filled"
              error={newUserEndTimeError}
              clearable={actuallyNullableEndTime}
            />
          </Box>
          {allowTeamMode && team.length > 1 && (
            <Box mt={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={teamMode}
                    onChange={() => setTeamMode(!teamMode)}
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
              maxRows={10}
              value={userComment}
              onChange={e => setUserComment(e.target.value)}
            />
          </Box>
        </>
      }
      actions={
        <>
          {!isCreation && (
            <Button
              variant="outlined"
              color="primary"
              disabled={!canSubmit(ACTIVITIES_OPERATIONS.cancel)}
              onClick={() => {
                modals.open("confirmation", {
                  title: "Confirmer la suppression",
                  content: (!otherUserActivities ||
                    otherUserActivities.length === 0) && (
                    <Notice
                      type="warning"
                      description="En supprimant la seule activité d'une mission, vous
                      annulerez la mission. Vous ne pourrez plus y apporter de
                      modifications."
                    />
                  ),
                  cancelButtonLabel: "Annuler",
                  confirmButtonLabel: "Valider",
                  handleConfirm: async () => {
                    if (
                      handleCancelMission &&
                      (!otherUserActivities || otherUserActivities.length === 0)
                    ) {
                      await handleCancelMission();
                    } else {
                      await handleSubmit(ACTIVITIES_OPERATIONS.cancel);
                    }
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
            disabled={
              !canSubmit(
                isCreation
                  ? ACTIVITIES_OPERATIONS.create
                  : ACTIVITIES_OPERATIONS.update
              )
            }
            onClick={async () => {
              await handleSubmit(
                isCreation
                  ? ACTIVITIES_OPERATIONS.create
                  : ACTIVITIES_OPERATIONS.update
              );
            }}
          >
            {isCreation ? "Créer" : "Modifier heure"}
          </LoadingButton>
        </>
      }
    />
  );
}
