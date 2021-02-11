import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { formatDateTime, now } from "common/utils/time";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { ACTIVITIES, TIMEABLE_ACTIVITIES } from "common/utils/activities";
import { getTime } from "common/utils/events";
import uniq from "lodash/uniq";
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

const useStyles = makeStyles(theme => ({
  formField: {
    marginBottom: theme.spacing(2)
  }
}));

export function ActivityRevisionOrCreationModal({
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
  const coworkers = store.getEntity("coworkers");
  const [isCreation, setIsCreation] = React.useState(undefined);

  const [newActivityType, setNewActivityType] = React.useState(undefined);
  const [newActivityDriverId, setNewActivityDriverId] = React.useState(
    undefined
  );

  const [teamMode, setTeamMode] = React.useState(false);

  const [newUserTime, setNewUserTime] = React.useState(undefined);
  const [newUserEndTime, setNewUserEndTime] = React.useState(undefined);
  const [newUserTimeError, setNewUserTimeError] = React.useState("");
  const [newUserEndTimeError, setNewUserEndTimeError] = React.useState("");

  const [userComment, setUserComment] = React.useState(undefined);

  const userId = store.userId();
  const team = newUserTime
    ? uniq([userId, ...resolveTeamAt(teamChanges, newUserTime)])
    : [userId];

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

  function handleSubmit(actionType) {
    if (actionType === "creation") {
      let driverId = null;
      if (requiresDriver()) driverId = newActivityDriverId;
      createActivity({
        activityType: newActivityType,
        startTime: newUserTime,
        endTime: newUserEndTime,
        driverId: driverId,
        userComment: userComment,
        team: teamMode ? team : [userId]
      });
    } else
      handleRevisionAction(
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
      setIsCreation(false);
    } else {
      setNewUserTime(undefined);
      setNewUserEndTime(undefined);
      setIsCreation(true);
    }
    setNewUserEndTimeError("");
    setNewUserTimeError("");
    setNewActivityDriverId(undefined);
    setUserComment(undefined);
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
      } else if (
        (nextMissionStart && newUserTime > nextMissionStart) ||
        newUserTime > now()
      ) {
        hasStartError = true;
        setNewUserTimeError(`Chevauchement avec la mission suivante.`);
      }

      if (newUserEndTime) {
        if (newUserEndTime < newUserTime) {
          hasEndError = true;
          setNewUserEndTimeError("La fin doit être après le début");
        } else if (newUserEndTime > now()) {
          hasEndError = true;
          setNewUserEndTimeError(
            `L'heure doit être avant ${formatDateTime(now())}`
          );
        }
      }

      if (!hasStartError && !hasEndError) {
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

      if (!hasStartError) setNewUserTimeError("");
      if (!hasEndError) setNewUserEndTimeError("");
    }
  }, [
    newUserTime,
    newUserEndTime,
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
      team &&
      team.length > 1
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
          !!newUserTime &&
          (nullableEndTime || !newUserEndTime) &&
          !newUserTimeError &&
          !newUserEndTimeError &&
          newActivityDriverId !== undefined
        );
      }
      return (
        !!newActivityType &&
        !!newUserTime &&
        (nullableEndTime || !newUserEndTime) &&
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
            value={isCreation ? newActivityType : event ? event.type : null}
            onChange={e => setNewActivityType(e.target.value)}
          >
            {Object.keys(TIMEABLE_ACTIVITIES).map(activityName => (
              <MenuItem key={activityName} value={activityName}>
                {TIMEABLE_ACTIVITIES[activityName].label}
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
                  {coworkers[id.toString()]
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
          {(isCreation || event) && (
            <DateTimePicker
              key={1}
              label="Fin"
              variant="filled"
              className={classes.formField}
              time={newUserEndTime}
              minTime={newUserTime}
              maxTime={nextMissionStart}
              setTime={setNewUserEndTime}
              error={newUserEndTimeError}
              clearable={nullableEndTime}
              noValidate
            />
          )}
        </Box>
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
        {!isCreation && event && (
          <Button
            variant="outlined"
            color="primary"
            disabled={!canSubmit("cancel")}
            onClick={() => {
              handleSubmit("cancel");
              handleClose();
            }}
          >
            Supprimer
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          disabled={!canSubmit(isCreation ? "creation" : "revision")}
          onClick={() => {
            handleSubmit(isCreation ? "creation" : "revision");
            handleClose();
          }}
        >
          {isCreation ? "Créer" : "Modifier heure"}
        </Button>
      </CustomDialogActions>
    </Dialog>
  );
}
