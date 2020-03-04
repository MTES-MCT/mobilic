import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import AppBar from "@material-ui/core/AppBar";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { VerticalTimeline } from "../../common/components/VerticalTimeline";
import {
  isoFormatDateTime,
  formatTimeOfDay,
  shortPrettyFormatDay,
  formatDateTime,
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
import { ACTIVITIES } from "../../common/utils/activities";
import useTheme from "@material-ui/core/styles/useTheme";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function ActivityRevisionModal({
  event,
  open,
  handleClose,
  handleRevisionAction,
  minEventTime,
  maxEventTime,
  cancellable
}) {
  const theme = useTheme();
  const [actionType, setActionType] = React.useState(undefined); // "cancel" or "revision"
  const [revisedEventTime, setRevisedEventTime] = React.useState(undefined);
  const [revisedEventTimeError, setRevisedEventTimeError] = React.useState("");

  const validatesRevisedEventTimeError = () => {
    console.log("Prout");
    if (revisedEventTime <= minEventTime) {
      setRevisedEventTimeError(
        `L'heure doit être après ${formatDateTime(minEventTime)}`
      );
    } else if (revisedEventTime >= maxEventTime) {
      setRevisedEventTimeError(
        `L'heure doit être avant ${formatDateTime(maxEventTime)}`
      );
    } else setRevisedEventTimeError("");
    return () => {};
  };

  React.useEffect(() => {
    event
      ? setRevisedEventTime(event.eventTime)
      : setRevisedEventTime(undefined);
    setActionType(undefined);
    return () => {};
  }, [open]);

  React.useEffect(validatesRevisedEventTimeError, [revisedEventTime]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Modifier l'activité</DialogTitle>
      {event && (
        <>
          <DialogContent>
            <Box my={2}>
              <Typography>
                ⚠️ Les modifications seront visibles par votre employeur et par
                les contrôleurs
              </Typography>
            </Box>
            <Box mb={1}>
              <Box className="flexbox-flex-start">
                <Typography className="bold">Activité :&nbsp;</Typography>
                {ACTIVITIES[event.type].renderIcon({
                  style: { color: theme.palette[event.type] }
                })}
              </Box>
              <Typography>
                <span className="bold">Heure de début : </span>
                {formatTimeOfDay(event.eventTime)}
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
            {actionType === "revision" && (
              <Box style={{ display: "flex", alignItems: "center" }}>
                <TextField
                  label="Début"
                  type="datetime-local"
                  value={isoFormatDateTime(revisedEventTime)}
                  inputProps={{
                    step: 60
                  }}
                  onChange={e => {
                    const dayVsTime = e.target.value.split("T");
                    const dayElements = dayVsTime[0].split("-");
                    const timeElements = dayVsTime[1].split(":");
                    const newRevisedEventTime = new Date(revisedEventTime);
                    newRevisedEventTime.setFullYear(parseInt(dayElements[0]));
                    newRevisedEventTime.setMonth(parseInt(dayElements[1]) - 1);
                    newRevisedEventTime.setDate(parseInt(dayElements[2]));
                    newRevisedEventTime.setHours(parseInt(timeElements[0]));
                    newRevisedEventTime.setMinutes(parseInt(timeElements[1]));
                    setRevisedEventTime(newRevisedEventTime.getTime());
                  }}
                  error={!!revisedEventTimeError}
                  helperText={revisedEventTimeError}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <IconButton onClick={handleClose}>
              <CloseIcon color="error" />
            </IconButton>
            <IconButton
              onClick={() => {
                handleRevisionAction(actionType, revisedEventTime);
                handleClose();
              }}
              disabled={
                !actionType ||
                (actionType === "revision" &&
                  (!!revisedEventTimeError ||
                    revisedEventTime === event.eventTime))
              }
              color="primary"
            >
              <CheckIcon />
            </IconButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export function WorkDayRevision({
  open,
  handleClose,
  activityEvents,
  handleActivityRevision
}) {
  const modals = React.useContext(ModalContext);

  const handleEventClick = event => {
    modals.open("activityRevision", {
      event,
      handleRevisionAction: (actionType, revisedEventTime) =>
        handleActivityRevision(event, actionType, revisedEventTime),
      minEventTime: getStartOfDay(activityEvents[0].eventTime),
      maxEventTime:
        event.type !== ACTIVITIES.rest.name &&
        activityEvents[activityEvents.length - 1].type === ACTIVITIES.rest.name
          ? activityEvents[activityEvents.length - 1].eventTime
          : Date.now(),
      cancellable:
        event.type !== ACTIVITIES.rest.name || activityEvents.length === 1
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
              {shortPrettyFormatDay(activityEvents[0].eventTime)}
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
    </Dialog>
  );
}
