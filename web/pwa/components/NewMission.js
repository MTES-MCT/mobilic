import React from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import { VehicleInput } from "./VehicleInput";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import { MainCtaButton } from "./MainCtaButton";
import { AddressField } from "../../common/AddressField";

export function NewMissionModal({
  open,
  handleClose,
  handleContinue,
  companyAddresses = []
}) {
  const [mission, setMission] = React.useState("");
  const [vehicle, setVehicle] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [currentPosition, setCurrentPosition] = React.useState(null);
  const [address, setAddress] = React.useState(null);

  React.useEffect(() => {
    setMission("");
    setVehicle(null);
    setCurrentPosition(null);
    setAddress(null);

    if (open) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentPosition(position);
      });
    }
  }, [open]);

  const funnelModalClasses = useFunnelModalStyles();

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container>
        <form
          autoComplete="off"
          onSubmit={async e => {
            setLoading(true);
            e.preventDefault();
            const payLoad = { mission, vehicle, address };
            await handleContinue(payLoad);
            setLoading(false);
          }}
        >
          <Container
            className={`day-info-inputs ${funnelModalClasses.slimContainer}`}
            style={{ flexShrink: 0 }}
            disableGutters
          >
            <Typography variant="h5" className="form-field-title">
              Votre mission a-t-elle un nom&nbsp;?
            </Typography>
            <TextField
              required
              fullWidth
              label="Nom de la mission"
              variant="filled"
              value={mission}
              onChange={e => setMission(e.target.value)}
            />
            <Typography variant="h5" className="form-field-title">
              Quel est le lieu de prise de service&nbsp;?
            </Typography>
            <AddressField
              fullWidth
              required
              label="Lieu de prise de service"
              variant="filled"
              value={address}
              onChange={setAddress}
              currentPosition={currentPosition}
              defaultAddresses={companyAddresses}
            />
            <Typography variant="h5" className="form-field-title">
              Utilisez-vous un véhicule&nbsp;?{" "}
            </Typography>
            <VehicleInput
              label="Nom ou immatriculation du véhicule"
              vehicle={vehicle}
              setVehicle={setVehicle}
            />
          </Container>
          <Box className="cta-container" my={4}>
            <MainCtaButton type="submit" loading={loading}>
              Continuer
            </MainCtaButton>
          </Box>
        </form>
      </Container>
    </FunnelModal>
  );
}
