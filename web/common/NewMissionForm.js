import React from "react";
import Typography from "@mui/material/Typography";
import TextField from "common/utils/TextField";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useStyles as useFunnelModalStyles } from "../pwa/components/FunnelModal";
import MenuItem from "@mui/material/MenuItem";
import { MainCtaButton } from "../pwa/components/MainCtaButton";
import { VehicleFieldForApp } from "../pwa/components/VehicleFieldForApp";
import { AddressField } from "./AddressField";
import { DateOrDateTimePicker } from "../pwa/components/DateOrDateTimePicker";
import { DAY, isoFormatLocalDate } from "common/utils/time";

export default function NewMissionForm({
  handleSubmit,
  companies,
  companyAddresses = [],
  currentPosition = null,
  disableKilometerReading = false,
  withDay = false,
  withEndLocation = false
}) {
  const [mission, setMission] = React.useState("");
  const [vehicle, setVehicle] = React.useState("");
  const [company, setCompany] = React.useState(
    companies && companies.length === 1 ? companies[0] : ""
  );
  const [day, setDay] = React.useState(null);
  const [dayError, setDayError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState(null);
  const [endAddress, setEndAddress] = React.useState(null);
  const [kilometerReading, setKilometerReading] = React.useState(null);

  React.useEffect(() => {
    setCompany(companies && companies.length === 1 ? companies[0] : "");
  }, [companies]);

  React.useEffect(() => {
    if (vehicle?.companyId) setVehicle("");
    if (address?.companyId) setAddress("");
    setMission("");
  }, [company]);

  React.useEffect(() => {
    if (!vehicle) setKilometerReading(null);
  }, [vehicle]);

  const funnelModalClasses = useFunnelModalStyles();

  const now1 = Date.now();

  return (
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
            endAddress,
            kilometerReading,
            day
          };
          await handleSubmit(payLoad);
          setLoading(false);
        }}
      >
        <Container
          className={`day-info-inputs ${funnelModalClasses.slimContainer}`}
          style={{ flexShrink: 0 }}
          disableGutters
        >
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
                value={company || ""}
                onChange={e => {
                  setCompany(e.target.value);
                }}
              >
                {companies.map(company => (
                  <MenuItem key={company.id} value={company}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            ]}
          {company?.settings?.requireMissionName && [
            <Typography key={1} variant="h5" className="form-field-title">
              Quel est le nom de la mission&nbsp;?
            </Typography>,
            <TextField
              key={2}
              required
              fullWidth
              label="Nom de la mission"
              variant="filled"
              value={mission}
              onChange={e => setMission(e.target.value)}
            />
          ]}
          {withDay && [
            <Typography key={1} variant="h5" className="form-field-title">
              Quel jour s'est déroulée la mission ?
            </Typography>,
            <DateOrDateTimePicker
              key={2}
              label="Jour de la mission"
              value={day}
              setValue={setDay}
              variant="filled"
              isDateTime={false}
              minValue={isoFormatLocalDate(new Date(now1 - 30 * DAY * 1000))}
              maxValue={isoFormatLocalDate(new Date(now1))}
              error={dayError}
              setError={setDayError}
              required
              autoValidate
            />
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
          {withEndLocation && [
            <Typography key={0} variant="h5" className="form-field-title">
              Quel est le lieu de fin de service&nbsp;?
            </Typography>,
            <AddressField
              key={1}
              fullWidth
              required
              label="Lieu de fin de service"
              disabled={companies && companies.length > 1 && !company}
              variant="filled"
              value={endAddress}
              onChange={setEndAddress}
              currentPosition={currentPosition}
              defaultAddresses={companyAddresses.filter(a =>
                company ? a.companyId === company.id : true
              )}
            />
          ]}
          <Typography variant="h5" className="form-field-title">
            Utilisez-vous un véhicule&nbsp;?{" "}
          </Typography>
          <VehicleFieldForApp
            label="Nom ou immatriculation du véhicule"
            fullWidth
            disabled={companies && companies.length > 1 && !company}
            vehicle={vehicle}
            setVehicle={setVehicle}
            companyId={company ? company.id : ""}
            kilometerReading={kilometerReading}
            setKilometerReading={
              !disableKilometerReading &&
              company &&
              company.settings &&
              company.settings.requireKilometerData &&
              vehicle
                ? setKilometerReading
                : ""
            }
          />
        </Container>
        <Box className="cta-container" my={4}>
          <MainCtaButton
            disabled={
              !address ||
              (!mission && company?.settings?.requireMissionName) ||
              (withEndLocation && !endAddress) ||
              (withDay && (dayError || !day))
            }
            type="submit"
            loading={loading}
          >
            Continuer
          </MainCtaButton>
        </Box>
      </form>
    </Container>
  );
}
