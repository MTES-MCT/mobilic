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
import Box from "@material-ui/core/Box";

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
      <Box className="header-container">
        <AppBar style={{ position: "relative" }}>
          <Toolbar className="flexbox-space-between">
            <IconButton edge="start" color="inherit" onClick={handleClose}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h3">Infos du jour</Typography>
            <IconButton edge="end" color="inherit" className="hidden">
              <ArrowBackIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Box>
      <Container className="stretch-container">
        <Container className="day-info-inputs vertical-form" disableGutters>
          <TextField
            fullWidth
            label="Nom de la mission"
            value={mission}
            onChange={e => setMission(e.target.value)}
          />
          <TextField
            fullWidth
            label="Immatriculation du véhicule"
            value={vehicleRegistrationNumber}
            onChange={e => setVehicleRegistrationNumber(e.target.value)}
          />
        </Container>
        <Box className="cta-container" mb={2}>
          <Button
            variant="contained"
            color="primary"
            disabled={!mission || !vehicleRegistrationNumber}
            onClick={async () => {
              const payLoad = { mission, vehicleRegistrationNumber };
              handleContinue(payLoad);
            }}
          >
            Continuer
          </Button>
        </Box>
      </Container>
    </Dialog>
  );
}
