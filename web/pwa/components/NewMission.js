import React from "react";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
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
  const [companyId, setCompanyId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [currentPosition, setCurrentPosition] = React.useState(null);
  const [address, setAddress] = React.useState(null);

  React.useEffect(() => {
    setMission("");
    setVehicle(null);
    setCompanyId(companies && companies.length === 1 ? companies[0].id : null);
    setCurrentPosition(null);
    setAddress(null);

    if (open && navigator.geolocation) {
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
            const payLoad = { mission, vehicle, address, companyId };
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
                  value={companyId}
                  onChange={e => {
                    const newCompanyId = e.target.value;
                    if (
                      newCompanyId &&
                      vehicle &&
                      vehicle.companyId !== newCompanyId
                    )
                      setVehicle(null);
                    if (
                      newCompanyId &&
                      address &&
                      address.companyId !== newCompanyId
                    )
                      setAddress(null);
                    setCompanyId(newCompanyId);
                  }}
                >
                  {companies.map(company => (
                    <MenuItem key={company.id} value={company.id}>
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
              disabled={companies && companies.length > 1 && !companyId}
              variant="filled"
              value={address}
              onChange={setAddress}
              currentPosition={currentPosition}
              defaultAddresses={companyAddresses.filter(a =>
                companyId ? a.companyId === companyId : true
              )}
            />
            <Typography variant="h5" className="form-field-title">
              Utilisez-vous un véhicule&nbsp;?{" "}
            </Typography>
            <VehicleInput
              label="Nom ou immatriculation du véhicule"
              disabled={companies && companies.length > 1 && !companyId}
              vehicle={vehicle}
              setVehicle={setVehicle}
              companyId={companyId}
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
