import React from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "common/utils/TextField";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import { VehicleInput } from "./VehicleInput";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import { MainCtaButton } from "./MainCtaButton";
import { AddressField } from "../../common/AddressField";
import MenuItem from "@material-ui/core/MenuItem";

export default function NewMissionModal({
  open,
  handleClose,
  handleContinue,
  companies,
  companyAddresses = []
}) {
  const [mission, setMission] = React.useState("");
  const [vehicle, setVehicle] = React.useState(null);
  const [company, setCompany] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [currentPosition, setCurrentPosition] = React.useState(null);
  const [address, setAddress] = React.useState(null);
  const [kilometerReading, setKilometerReading] = React.useState(null);

  React.useEffect(() => {
    setMission("");
    setVehicle(null);
    setCompany(companies && companies.length === 1 ? companies[0] : null);
    setCurrentPosition(null);
    setAddress(null);
    setKilometerReading(null);

    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setCurrentPosition(position);
      });
    }
  }, [open]);

  React.useEffect(() => {
    if (!vehicle) setKilometerReading(null);
  }, [vehicle]);

  const funnelModalClasses = useFunnelModalStyles();

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container>
        <form
          autoComplete="off"
          onSubmit={async e => {
            setLoading(true);
            e.preventDefault();
            const payLoad = {
              mission,
              vehicle,
              address,
              company,
              kilometerReading
            };
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
              Quel est le nom de la mission&nbsp;?
            </Typography>
            <TextField
              required
              fullWidth
              label="Nom de la mission"
              variant="filled"
              value={mission}
              onChange={e => setMission(e.target.value)}
            />
            {companies &&
              companies.length > 1 && [
                <Typography key={0} variant="h5" className="form-field-title">
                  Pour quelle entreprise&nbsp;?
                </Typography>,
                <TextField
                  key={1}
                  label="Entreprise"
                  required
                  fullWidth
                  variant="filled"
                  select
                  value={company || null}
                  onChange={e => {
                    const newCompany = e.target.value;
                    if (
                      newCompany &&
                      vehicle &&
                      vehicle.companyId !== newCompany.id
                    )
                      setVehicle(null);
                    if (
                      newCompany &&
                      address &&
                      address.companyId !== newCompany.id
                    )
                      setAddress(null);
                    setCompany(newCompany);
                  }}
                >
                  {companies.map(company => (
                    <MenuItem key={company.id} value={company}>
                      {company.name}
                    </MenuItem>
                  ))}
                </TextField>
              ]}
            <Typography variant="h5" className="form-field-title">
              Quel est le lieu de prise de service&nbsp;?
            </Typography>
            <AddressField
              fullWidth
              required
              label="Lieu de prise de service"
              disabled={companies && companies.length > 1 && !company}
              variant="filled"
              value={address}
              onChange={setAddress}
              currentPosition={currentPosition}
              defaultAddresses={companyAddresses.filter(a =>
                company ? a.companyId === company.id : true
              )}
            />
            <Typography variant="h5" className="form-field-title">
              Utilisez-vous un véhicule&nbsp;?{" "}
            </Typography>
            <VehicleInput
              label="Nom ou immatriculation du véhicule"
              disabled={companies && companies.length > 1 && !company}
              vehicle={vehicle}
              setVehicle={setVehicle}
              companyId={company ? company.id : null}
              kilometerReading={kilometerReading}
              setKilometerReading={
                company &&
                company.settings &&
                company.settings.requireKilometerData &&
                vehicle
                  ? setKilometerReading
                  : null
              }
            />
          </Container>
          <Box className="cta-container" my={4}>
            <MainCtaButton
              disabled={!address || !mission}
              type="submit"
              loading={loading}
            >
              Continuer
            </MainCtaButton>
          </Box>
        </form>
      </Container>
    </FunnelModal>
  );
}
