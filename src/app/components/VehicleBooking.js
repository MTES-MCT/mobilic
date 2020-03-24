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

export function VehicleBookingModal({
  open,
  currentVehicleBooking,
  handleClose,
  handleContinue
}) {
  const [registrationNumber, setRegistrationNumber] = React.useState("");
  const [bookingTime, setBookingTime] = React.useState(undefined);
  const [bookingTimeError, setBookingTimeError] = React.useState("");

  React.useEffect(() => {
    setBookingTime(Date.now());
    setRegistrationNumber("");
  }, [open]);

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle>Nouveau véhicule</DialogTitle>
      <DialogContent>
        {currentVehicleBooking && (
          <Box my={2}>
            <Typography>
              Véhicule actuel : {currentVehicleBooking.registrationNumber}
            </Typography>
            <Typography>
              Occupé depuis {formatTimeOfDay(getTime(currentVehicleBooking))}
            </Typography>
          </Box>
        )}
        <Box my={2}>
          <TextField
            fullWidth
            label="Nouvelle immatriculation"
            value={registrationNumber}
            onChange={e => setRegistrationNumber(e.target.value)}
          />
          <Box mb={1} />
          <DateTimePicker
            label="Heure de début"
            time={bookingTime}
            setTime={setBookingTime}
            error={bookingTimeError}
            setError={setBookingTimeError}
            minTime={
              currentVehicleBooking ? getTime(currentVehicleBooking) : null
            }
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
            handleContinue(registrationNumber, bookingTime);
            handleClose();
          }}
          disabled={!registrationNumber || bookingTimeError || false}
        >
          <CheckIcon color="primary" />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
