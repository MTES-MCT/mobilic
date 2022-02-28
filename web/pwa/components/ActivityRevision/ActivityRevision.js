import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { now, sameMinute, truncateMinute } from "common/utils/time";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "common/utils/TextField";
import {
  ACTIVITIES,
  ACTIVITIES_OPERATIONS,
  convertNewActivityIntoActivityOperations
} from "common/utils/activities";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import MenuItem from "@material-ui/core/MenuItem";
import { formatPersonName, resolveTeamAt } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { DateOrDateTimePicker } from "../DateOrDateTimePicker";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Switch from "@material-ui/core/Switch/Switch";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../../common/CustomDialogTitle";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";
import { LoadingButton } from "common/components/LoadingButton";
import OverlappedActivityList from "./OverlappedActivityList";
import _ from "lodash";

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
  allowTeamMode = false,
  nullableEndTime = true,
  allowSupportActivity = true,
  allowTransfers = false,
  createActivity,
  defaultTime = null,
  forcedUser = null,
  displayWarningMessage = true
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

  const userId = forcedUser?.id || store.userId();
  const team = newUserTime
    ? uniq([userId, ...resolveTeamAt(teamChanges, newUserTime)])
    : [userId];

  const isCreation = !event;
  const actuallyNullableEndTime =
    nullableEndTime && newActivityType !== ACTIVITIES.break.name;

  const activityType = event ? event.type : newActivityType;

  async function changeActivities(sideEffectOperations, actionType) {
    await Promise.all(
      sideEffectOperations.map(op => {
        if (op.operation === ACTIVITIES_OPERATIONS.create) {
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
          team: teamMode ? team : [userId]
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
      setNewUserEndTime(event.endTime);
    } else {
      setNewUserTime(defaultTime);
      setNewUserEndTime(defaultTime);
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
          const userActivities = otherActivities.filter(
            a => a.userId === userId
          );
          const earliestActivityStart = min(
            userActivities.map(a => a.startTime)
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
        }
      }

      if (!hasStartError) setNewUserTimeError("");
      if (!hasEndError) setNewUserEndTimeError("");
    }
  }, [
    newUserTime,
    newUserEndTime,
    activityType,
    previousMissionEnd,
    nextMissionStart,
    userId,
    teamMode
  ]);

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

  const classes = useStyles();

  return (
    <Dialog open={open} onClose={handleClose}>
      <CustomDialogTitle
        title={isCreation ? "Nouvelle activité" : "Modifier l'activité"}
        handleClose={handleClose}
      />
      <DialogContent dividers>
        {displayWarningMessage && (
          <Box my={2} mb={4}>
            <Typography>
              ⚠️ Les modifications seront visibles par votre employeur et par
              les contrôleurs
            </Typography>
          </Box>
        )}
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
            {Object.keys(ACTIVITIES)
              .filter(a =>
                allowSupportActivity
                  ? true
                  : a !== ACTIVITIES.support.name && allowTransfers
                  ? true
                  : a !== ACTIVITIES.transfer.name
              )
              .map(activityName => (
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
          <DateOrDateTimePicker
            key={0}
            label="Début"
            variant="filled"
            className={classes.formField}
            value={newUserTime}
            setValue={_.flow([truncateMinute, setNewUserTime])}
            error={newUserTimeError}
            minValue={previousMissionEnd}
            maxValue={nextMissionStart}
            required
            noValidate
          />
          <DateOrDateTimePicker
            key={1}
            label="Fin"
            variant="filled"
            className={classes.formField}
            required={!actuallyNullableEndTime}
            value={newUserEndTime}
            minValue={newUserTime}
            maxValue={nextMissionStart}
            setValue={_.flow([truncateMinute, setNewUserEndTime])}
            error={newUserEndTimeError}
            clearable={actuallyNullableEndTime}
            noValidate
          />
        </Box>
        {allowTeamMode && team.length > 1 && (
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
            disabled={!canSubmit(ACTIVITIES_OPERATIONS.cancel)}
            onClick={() => {
              modals.open("confirmation", {
                title:
                  otherActivities?.length > 0
                    ? "Confirmer suppression"
                    : "En supprimant la seule activité d'une mission, vous annulerez la mission.",
                textButtons: true,
                handleConfirm: async () => {
                  await handleSubmit(ACTIVITIES_OPERATIONS.cancel);
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
      </CustomDialogActions>
    </Dialog>
  );
}
