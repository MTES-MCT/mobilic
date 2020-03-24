import React from "react";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { formatTimeOfDay } from "../../common/utils/time";
import { getTime } from "../../common/utils/events";
import { DateTimePicker } from "./DateTimePicker";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

export function MissionChangeModal({
  open,
  currentMission,
  handleClose,
  handleContinue
}) {
  const [mission, setMission] = React.useState("");
  const [missionStartTime, setMissionStartTime] = React.useState(undefined);
  const [missionStartTimeError, setMissionStartTimeError] = React.useState("");

  React.useEffect(() => {
    setMissionStartTime(Date.now());
    setMission("");
  }, [open]);

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle>Nouvelle mission</DialogTitle>
      <DialogContent>
        {currentMission && (
          <Box my={2}>
            <Typography>Mission en cours : {currentMission.name}</Typography>
            <Typography>
              Débutée à : {formatTimeOfDay(getTime(currentMission))}
            </Typography>
          </Box>
        )}
        <Box my={2}>
          <TextField
            fullWidth
            label="Nouvelle mission"
            value={mission}
            onChange={e => setMission(e.target.value)}
          />
          <Box mb={1} />
          <DateTimePicker
            label="Heure de début"
            time={missionStartTime}
            setTime={setMissionStartTime}
            error={missionStartTimeError}
            setError={setMissionStartTimeError}
            minTime={currentMission ? getTime(currentMission) : null}
            maxTime={Date.now()}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleClose}>
          <CloseIcon color="error" />
        </IconButton>
        <IconButton
          onClick={() => {
            handleContinue(mission, missionStartTimeError);
            handleClose();
          }}
          disabled={!mission || missionStartTimeError}
        >
          <CheckIcon color="primary" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
