import React from "react";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { formatTimeOfDay } from "common/utils/time";
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
import MenuItem from "@material-ui/core/MenuItem";
import { formatPersonName, resolveTeamAt } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { DateTimePicker } from "./DateTimePicker";

export function ActivityRevisionOrCreationModal({
  event,
  teamChanges = [],
  open,
  handleClose,
  handleRevisionAction,
  minStartTime,
  maxStartTime,
  cancellable,
  createActivity
}) {
  const theme = useTheme();
  const store = useStoreSyncedWithLocalStorage();
  const [actionType, setActionType] = React.useState(undefined); // "cancel", "revision" or "creation"

  const [newActivityType, setNewActivityType] = React.useState(undefined);
  const [newActivityDriver, setNewActivityDriver] = React.useState(undefined);

  const [newUserTime, setNewUserTime] = React.useState(undefined);
  const [newUserEndTime, setNewUserEndTime] = React.useState(undefined);
  const [newUserTimeError, setNewUserTimeError] = React.useState("");
  const [newUserEndTimeError, setNewUserEndTimeError] = React.useState("");

  const [userComment, setUserComment] = React.useState(undefined);

  const user = store.userInfo();
  const team = newUserTime
    ? [user, ...resolveTeamAt(teamChanges, newUserTime)]
    : [user];

  function handleSubmit() {
    if (actionType === "creation") {
      let driver = null;
      if (requiresDriver()) driver = newActivityDriver;
      createActivity({
        activityType: newActivityType,
        userTime: newUserTime,
        userEndTime: newUserEndTime,
        driver: driver,
        userComment: userComment
      });
    } else
      handleRevisionAction(
        actionType,
        newUserTime,
        newUserEndTime,
        userComment
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
    setNewActivityDriver(undefined);
    setUserComment(undefined);
    return () => {};
  }, [open]);

  function requiresDriver() {
    return (
      actionType === "creation" &&
      newActivityType === ACTIVITIES.drive.name &&
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
          !!newUserEndTime &&
          !newUserTimeError &&
          !newUserEndTimeError &&
          newActivityDriver !== undefined
        );
      }
      return (
        !!newActivityType &&
        !!newUserTime &&
        !!newUserEndTime &&
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
              value={newActivityDriver}
              onChange={e => setNewActivityDriver(e.target.value)}
            >
              {team.map((teamMate, index) => (
                <MenuItem key={index} value={teamMate}>
                  {formatPersonName(teamMate)}
                </MenuItem>
              ))}
            </TextField>
          )}
          {(actionType === "revision" || actionType === "creation") && [
            <DateTimePicker
              key={0}
              label="Début"
              time={newUserTime}
              setTime={setNewUserTime}
              error={newUserTimeError}
              setError={setNewUserTimeError}
              minTime={minStartTime}
              maxTime={
                newUserEndTime
                  ? maxStartTime
                    ? Math.min(newUserEndTime, maxStartTime)
                    : newUserEndTime
                  : maxStartTime
              }
              required={true}
            />,
            (actionType === "creation" || (event && event.endTime)) && (
              <DateTimePicker
                key={1}
                label="Fin"
                time={newUserEndTime}
                setTime={setNewUserEndTime}
                error={newUserEndTimeError}
                setError={setNewUserEndTimeError}
                minTime={newUserTime || minStartTime}
                maxTime={Date.now()}
                required={true}
              />
            )
          ]}
        </Box>
        <Box mt={2}>
          <TextField
            label="Raison (optionnelle)"
            optional
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
