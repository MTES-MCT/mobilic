import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import AppBar from "@material-ui/core/AppBar";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import AddIcon from "@material-ui/icons/Add";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";
import { VerticalTimeline } from "../../common/components/VerticalTimeline";
import {
  formatTimeOfDay,
  shortPrettyFormatDay,
  getStartOfDay
} from "../../common/utils/time";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";
import { ModalContext } from "../../common/utils/modals";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import ToggleButton from "@material-ui/lab/ToggleButton";
import { ACTIVITIES, TIMEABLE_ACTIVITIES } from "../../common/utils/activities";
import useTheme from "@material-ui/core/styles/useTheme";
import { getTime } from "../../common/utils/events";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import MenuItem from "@material-ui/core/MenuItem";
import { formatPersonName, resolveTeamAt } from "../../common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/store";
import { DateTimePicker } from "./DateTimePicker";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ActivityRevisionOrCreationModal({
  event,
  open,
  handleClose,
  handleRevisionAction,
  minStartTime,
  maxStartTime,
  cancellable,
  createActivity
}) {
  const theme = useTheme();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const [actionType, setActionType] = React.useState(undefined); // "cancel", "revision" or "creation"

  const [newActivityType, setNewActivityType] = React.useState(undefined);
  const [newActivityIsTeamMode, setNewActivityIsTeamMode] = React.useState(
    true
  );
  const [newActivityDriverId, setNewActivityDriverId] = React.useState(
    undefined
  );

  const [newStartTime, setNewStartTime] = React.useState(undefined);
  const [newStartTimeError, setNewStartTimeError] = React.useState("");

  const user = storeSyncedWithLocalStorage.userInfo();
  const team = newStartTime
    ? [user, ...resolveTeamAt(newStartTime, storeSyncedWithLocalStorage)]
    : [user];

  function handleSubmit() {
    if (actionType === "creation") {
      let driverId = null;
      if (requiresDriverId()) driverId = newActivityDriverId;
      createActivity(newActivityType, newStartTime, driverId);
    } else handleRevisionAction(actionType, newStartTime);
  }

  React.useEffect(() => {
    if (event) {
      setNewStartTime(getTime(event));
      setActionType(undefined);
    } else {
      setNewStartTime(undefined);
      setActionType("creation");
    }
    setNewActivityDriverId(undefined);
    return () => {};
  }, [open]);

  function requiresDriverId() {
    return (
      actionType === "creation" &&
      newActivityType === ACTIVITIES.drive.name &&
      newActivityIsTeamMode &&
      team &&
      team.length > 1
    );
  }

  function canSubmit() {
    if (actionType === "cancel") {
      return !!event;
    }
    if (actionType === "revision") {
      return event && getTime(event) !== newStartTime && !newStartTimeError;
    }
    if (actionType === "creation") {
      if (requiresDriverId()) {
        return (
          !!newActivityType &&
          !!newStartTime &&
          !newStartTimeError &&
          newActivityDriverId !== undefined
        );
      }
      return !!newActivityType && !!newStartTime && !newStartTimeError;
    }
    return false;
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {actionType === "creation"
          ? "Nouvelle activité"
          : "Modifier l'activité"}
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
              <Box className="flexbox-flex-start">
                <Typography className="bold">Activité :&nbsp;</Typography>
                {ACTIVITIES[event.type].renderIcon({
                  style: { color: theme.palette[event.type] }
                })}
              </Box>
              <Typography>
                <span className="bold">Heure de début : </span>
                {formatTimeOfDay(getTime(event))}
              </Typography>
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
          {requiresDriverId() && (
            <TextField
              label="Conducteur"
              required
              fullWidth
              select
              value={newActivityDriverId}
              onChange={e => setNewActivityDriverId(e.target.value)}
            >
              {team.map((teamMate, index) => (
                <MenuItem key={index} value={teamMate.id}>
                  {formatPersonName(teamMate)}
                </MenuItem>
              ))}
            </TextField>
          )}
          {(actionType === "revision" || actionType === "creation") && (
            <DateTimePicker
              label="Début"
              value={newStartTime}
              setValue={setNewStartTime}
              error={newStartTimeError}
              setError={setNewStartTimeError}
              minTime={minStartTime}
              maxTime={maxStartTime}
              required={true}
            />
          )}
          {actionType === "creation" && (
            <FormControlLabel
              control={
                <Switch
                  checked={newActivityIsTeamMode}
                  onChange={() =>
                    setNewActivityIsTeamMode(!newActivityIsTeamMode)
                  }
                  color="primary"
                />
              }
              label="Pour toute l'équipe"
              labelPlacement="end"
            />
          )}
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

export function WorkDayRevision({
  open,
  handleClose,
  activityEvents,
  handleActivityRevision,
  pushNewActivityEvent
}) {
  const modals = React.useContext(ModalContext);

  const handleEventClick = event => {
    modals.open("activityRevision", {
      event,
      handleRevisionAction: (actionType, revisedEventTime) =>
        handleActivityRevision(event, actionType, revisedEventTime),
      minStartTime:
        event.type === ACTIVITIES.rest.name &&
        activityEvents[activityEvents.length - 1].type ===
          ACTIVITIES.rest.name &&
        activityEvents.length > 1
          ? getTime(activityEvents[activityEvents.length - 2])
          : getStartOfDay(getTime(activityEvents[0])),
      maxStartTime:
        event.type !== ACTIVITIES.rest.name &&
        activityEvents[activityEvents.length - 1].type === ACTIVITIES.rest.name
          ? getTime(activityEvents[activityEvents.length - 1])
          : Date.now(),
      cancellable:
        event.type !== ACTIVITIES.rest.name || activityEvents.length === 1
    });
  };

  const handleNewActivityClick = () => {
    const lastActivityOfTheDay = activityEvents[activityEvents.length - 1];
    modals.open("activityRevision", {
      minStartTime: getStartOfDay(getTime(activityEvents[0])),
      maxStartTime:
        activityEvents[activityEvents.length - 1].type === ACTIVITIES.rest.name
          ? getTime(activityEvents[activityEvents.length - 1])
          : Date.now(),
      createActivity: (activityType, startTime, driverId) =>
        pushNewActivityEvent({
          activityType,
          driverId,
          mission: lastActivityOfTheDay.mission,
          vehicleRegistrationNumber:
            lastActivityOfTheDay.vehicleRegistrationNumber,
          startTime
        })
    });
  };

  if (!activityEvents) return null;
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={() => {}}
      TransitionComponent={Transition}
    >
      <Box className="header-container">
        <AppBar style={{ position: "relative" }}>
          <Toolbar className="flexbox-space-between">
            <IconButton edge="start" color="inherit" onClick={handleClose}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" align="center">
              Corriger journée du{" "}
              {shortPrettyFormatDay(getTime(activityEvents[0]))}
            </Typography>
            <IconButton edge="end" color="inherit" className="hidden">
              <ArrowBackIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <VerticalTimeline
        activityEvents={activityEvents}
        handleEventClick={handleEventClick}
      />
      <Box
        pb={1}
        px={2}
        className="full-width"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          position: "fixed",
          bottom: 0,
          pointerEvents: "none"
        }}
      >
        <Fab
          color="primary"
          style={{ pointerEvents: "auto" }}
          onClick={handleNewActivityClick}
        >
          <AddIcon />
        </Fab>
      </Box>
    </Dialog>
  );
}
