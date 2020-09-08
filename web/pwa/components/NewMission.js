import React from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import { VehicleInput } from "./VehicleInput";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import { MainCtaButton } from "./MainCtaButton";

export function NewMissionModal({ open, handleClose, handleContinue }) {
  const [mission, setMission] = React.useState("");
  const [vehicle, setVehicle] = React.useState(null);

  React.useEffect(() => {
    setMission("");
    setVehicle(null);
  }, [open]);

  const funnelModalClasses = useFunnelModalStyles();

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container className="flex-column-space-between" style={{ flexGrow: 1 }}>
        <form
          noValidate
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            const payLoad = { mission, vehicle };
            await handleContinue(payLoad);
          }}
        >
          <Container
            className={`day-info-inputs ${funnelModalClasses.slimContainer}`}
            disableGutters
          >
            <Typography variant="h5">
              Votre mission a-t-elle un nom&nbsp;? (optionnel)
            </Typography>
            <TextField
              fullWidth
              label="Nom de la mission"
              variant="filled"
              value={mission}
              onChange={e => setMission(e.target.value)}
            />
            <Box my={2} />
            <Typography variant="h5">
              Utilisez-vous un véhicule&nbsp;? (optionnel){" "}
            </Typography>
            <VehicleInput
              label="Nom ou immatriculation du véhicule"
              vehicle={vehicle}
              setVehicle={setVehicle}
            />
          </Container>
          <Box className="cta-container" mb={4}>
            <MainCtaButton type="submit">Continuer</MainCtaButton>
          </Box>
        </form>
      </Container>
    </FunnelModal>
  );
}
