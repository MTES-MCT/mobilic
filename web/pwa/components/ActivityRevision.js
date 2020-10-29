import React from "react";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { formatDateTime, formatTimeOfDay, now } from "common/utils/time";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { ACTIVITIES, TIMEABLE_ACTIVITIES } from "common/utils/activities";
import useTheme from "@material-ui/core/styles/useTheme";
import { getTime } from "common/utils/events";
import uniq from "lodash/uniq";
import MenuItem from "@material-ui/core/MenuItem";
import { formatPersonName, resolveTeamAt } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { DateTimePicker } from "./DateTimePicker";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Switch from "@material-ui/core/Switch/Switch";

export function ActivityRevisionOrCreationModal({
  event,
  teamChanges = {},
  otherActivities = [],
  open,
  handleClose,
  handleRevisionAction,
  minStartTime,
  maxStartTime,
  cancellable,
  nullableEndTime = true,
  createActivity
}) {
  const theme = useTheme();
  const store = useStoreSyncedWithLocalStorage();
  const coworkers = store.getEntity("coworkers");
  const [actionType, setActionType] = React.useState(undefined); // "cancel", "revision" or "creation"

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

  function handleSubmit() {
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
      setActionType(undefined);
    } else {
      setNewUserTime(undefined);
      setNewUserEndTime(undefined);
      setActionType("creation");
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
      if (minStartTime && newUserTime < minStartTime) {
        hasStartError = true;
        setNewUserTimeError(
          `L'heure doit être après ${formatDateTime(minStartTime)}`
        );
      } else if (
        (maxStartTime && newUserTime > maxStartTime) ||
        newUserTime > now()
      ) {
        hasStartError = true;
        setNewUserTimeError(
          `L'heure doit être avant ${formatDateTime(maxStartTime)}`
        );
      }

      if (newUserEndTime) {
        if (newUserEndTime <= newUserTime) {
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
    minStartTime,
    maxStartTime,
    userId,
    teamMode
  ]);

  function requiresDriver() {
    return (
      actionType === "creation" &&
      (newActivityType === ACTIVITIES.drive.name ||
        newActivityType === ACTIVITIES.support.name) &&
      team &&
      team.length > 1
    );
  }

  function canSubmit() {
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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle disableTypography>
        <Typography variant="h4">
          {actionType === "creation"
            ? "Nouvelle activité"
            : "Modifier l'activité"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box my={2}>
          <Typography>
            ⚠️ Les modifications seront visibles par votre employeur et par les
            contrôleurs
          </Typography>
        </Box>
        {event && (
          <>
            <Box mb={1}>
              <Box className="flex-row-flex-start">
                <Typography className="bold">Activité :&nbsp;</Typography>
                {ACTIVITIES[event.type].renderIcon({
                  style: { color: theme.palette[event.type] }
                })}
              </Box>
              <Typography>
                <span className="bold">Début : </span>
                {formatTimeOfDay(getTime(event))}
              </Typography>
              {event.endTime && (
                <Typography>
                  <span className="bold">Fin : </span>
                  {formatTimeOfDay(event.endTime)}
                </Typography>
              )}
            </Box>
            <Box m={2} style={{ display: "flex", justifyContent: "center" }}>
              <ToggleButtonGroup
                value={actionType}
                exclusive
                onChange={(e, newType) => setActionType(newType)}
              >
                <ToggleButton disabled={!cancellable} value="cancel">
                  Supprimer
                </ToggleButton>
                <ToggleButton value="revision">Modifier heure</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </>
        )}
        <Box mt={3}>
          {actionType === "creation" && (
            <TextField
              label="Activité"
              required
              fullWidth
              select
              value={newActivityType}
              onChange={e => setNewActivityType(e.target.value)}
            >
              {Object.keys(TIMEABLE_ACTIVITIES).map(activityName => (
                <MenuItem key={activityName} value={activityName}>
                  {TIMEABLE_ACTIVITIES[activityName].label}
                </MenuItem>
              ))}
            </TextField>
          )}
          {requiresDriver() && (
            <TextField
              label="Conducteur"
              required
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
          {(actionType === "revision" || actionType === "creation") && [
            <DateTimePicker
              key={0}
              label="Début"
              time={newUserTime}
              setTime={setNewUserTime}
              error={newUserTimeError}
              required={true}
              noValidate
            />,
            (actionType === "creation" || event) && (
              <DateTimePicker
                key={1}
                label="Fin"
                time={newUserEndTime}
                setTime={setNewUserEndTime}
                error={newUserEndTimeError}
                required={true}
                clearable={nullableEndTime}
                noValidate
              />
            )
          ]}
        </Box>
        <Box mt={2}>
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
        <Box mt={2}>
          <TextField
            label="Raison (optionnelle)"
            fullWidth
            multiline
            rowsMax={10}
            value={userComment}
            onChange={e => setUserComment(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleClose}>
          <CloseIcon color="error" />
        </IconButton>
        <IconButton
          onClick={() => {
            handleSubmit();
            handleClose();
          }}
          disabled={!canSubmit()}
          color="primary"
        >
          <CheckIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
