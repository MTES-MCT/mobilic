import React from "react";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import AppBar from "@material-ui/core/AppBar";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function MissionSelectionModal({ open, handleClose, handleContinue }) {
  const [mission, setMission] = React.useState("");
  const [
    vehicleRegistrationNumber,
    setVehicleRegistrationNumber
  ] = React.useState("");

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={() => {}}
      TransitionComponent={Transition}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
        <AppBar style={{ position: "relative" }}>
          <Toolbar className="app-header">
            <IconButton edge="start" color="inherit" onClick={handleClose}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">Infos du jour</Typography>
            <Button
              autoFocus
              color="inherit"
              disabled={!mission || !vehicleRegistrationNumber}
              onClick={async () => {
                const payLoad = { mission, vehicleRegistrationNumber };
                handleContinue(payLoad);
              }}
            >
              OK
            </Button>
          </Toolbar>
        </AppBar>
      </div>
      <Container className="day-info-inputs">
        <TextField
          fullWidth
          label="Nom de la mission"
          className="day-info-text-field"
          value={mission}
          onChange={e => setMission(e.target.value)}
        />
        <TextField
          fullWidth
          label="Immatriculation du véhicule"
          className="day-info-text-field"
          value={vehicleRegistrationNumber}
          onChange={e => setVehicleRegistrationNumber(e.target.value)}
        />
      </Container>
    </Dialog>
  );
}
