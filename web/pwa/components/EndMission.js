import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { FunnelModal } from "./FunnelModal";
import Container from "@mui/material/Container";
import { MainCtaButton } from "./MainCtaButton";
import TextField from "common/utils/TextField";
import { Expenditures } from "./Expenditures";
import { AddressField } from "../../common/AddressField";
import KilometerReadingField from "../../common/KilometerReadingField";
import { NativeDateTimePicker } from "../../common/NativeDateTimePicker";
import { HOUR, getDaysBetweenTwoDates, now } from "common/utils/time";
import { setCurrentLocation } from "common/utils/location";
import { useSnackbarAlerts } from "../../common/Snackbar";

export default function EndMissionModal({
  open,
  handleClose,
  handleMissionEnd,
  currentExpenditures,
  companyAddresses = [],
  currentMission,
  currentEndLocation = null,
  missionEndTime,
  missionMinEndTime
}) {
  const [expenditures, setExpenditures] = React.useState({});
  const [endTime, setEndTime] = React.useState(
    missionEndTime || (missionMinEndTime ? missionMinEndTime + HOUR : null)
  );
  const [comment, setComment] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState(false);
  const [kilometerReading, setKilometerReading] = React.useState(false);
  const [kilometerReadingError, setKilometerReadingError] = React.useState(
    null
  );
  const [missionEndTimeError, setMissionEndTimeError] = React.useState("");
  const [currentPosition, setCurrentPosition] = React.useState(null);

  function canSubmit() {
    return (
      (currentEndLocation || address) &&
      !kilometerReadingError &&
      endTime &&
      !missionEndTimeError
    );
  }
  const alerts = useSnackbarAlerts();

  const askCurrentPosition = (askedByUser = true) => {
    if (open) {
      setCurrentLocation(setCurrentPosition, alerts, askedByUser);
    }
  };

  React.useEffect(() => {
    setExpenditures(currentExpenditures || {});
    setComment("");
    setAddress(null);
    setCurrentPosition(null);
    setKilometerReading("");
    setMissionEndTimeError("");

    if (open) {
      setLoading(false);
      if (!currentEndLocation) {
        askCurrentPosition(false);
      }
    }
  }, [currentExpenditures, currentEndLocation, open]);

  React.useEffect(() => {
    if (endTime) {
      let hasEndError = false;
      if (endTime < missionMinEndTime) {
        hasEndError = true;
        setMissionEndTimeError(
          "L'heure de fin doit être après le début de la dernière activité."
        );
      } else if (endTime > now()) {
        hasEndError = true;
        setMissionEndTimeError(
          "L'heure de fin ne peut pas être dans le futur."
        );
      }
      if (!hasEndError) setMissionEndTimeError("");
    }
  }, [endTime]);

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container className="flex-column-space-between" style={{ flexGrow: 1 }}>
        <form
          autoComplete="off"
          onSubmit={async e => {
            e.preventDefault();
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            await handleMissionEnd(
              expenditures,
              comment,
              address,
              kilometerReading,
              endTime
            );
            handleClose();
          }}
        >
          <Container
            className="flex-column"
            style={{ flexShrink: 0 }}
            disableGutters
          >
            {!missionEndTime && (
              <Box key={0}>
                <Typography variant="h5" className="form-field-title">
                  Quelle est l'heure de fin de la mission&nbsp;?
                </Typography>
                <NativeDateTimePicker
                  key={0}
                  label="Heure de fin"
                  value={endTime}
                  setValue={setEndTime}
                  minDateTime={missionMinEndTime}
                  maxDateTime={now()}
                  required
                  variant="filled"
                  error={missionEndTimeError}
                />
              </Box>
            )}
            <Typography variant="h5" className="form-field-title">
              Quel est le lieu de fin de service&nbsp;?
            </Typography>
            <AddressField
              required
              fullWidth
              label="Lieu de fin de service"
              variant="filled"
              value={currentEndLocation ? currentEndLocation : address}
              disabled={!!currentEndLocation}
              onChange={setAddress}
              currentPosition={currentPosition}
              defaultAddresses={companyAddresses}
              askCurrentPosition={askCurrentPosition}
              disableGeolocation={false}
            />
            {currentMission.company &&
            currentMission.company.settings &&
            currentMission.company.settings.requireKilometerData &&
            currentMission.startLocation &&
            currentMission.startLocation.kilometerReading
              ? [
                  <Typography key={0} variant="h5" className="form-field-title">
                    Quel est le relevé kilométrique de fin de service&nbsp;?
                  </Typography>,
                  <KilometerReadingField
                    key={1}
                    kilometerReading={kilometerReading}
                    minReading={currentMission.startLocation.kilometerReading}
                    setKilometerReading={setKilometerReading}
                    error={kilometerReadingError}
                    setError={setKilometerReadingError}
                  />
                ]
              : null}
            {(!currentMission.company ||
              !currentMission.company.settings ||
              currentMission.company.settings.requireExpenditures) && (
              <>
                <Typography variant="h5" className="form-field-title">
                  Avez-vous eu des frais lors de cette mission&nbsp;?
                </Typography>
                <Expenditures
                  expenditures={expenditures}
                  setExpenditures={setExpenditures}
                  listPossibleSpendingDays={getDaysBetweenTwoDates(
                    currentMission.startTime,
                    currentMission.endTime || endTime || now()
                  )}
                />
              </>
            )}
            <Typography variant="h5" className="form-field-title">
              Avez-vous une observation&nbsp;? (optionnel)
            </Typography>
            <TextField
              fullWidth
              label="Observation"
              variant="filled"
              multiline
              minRows={4}
              maxRows={10}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </Container>
          <Box className="cta-container" my={4}>
            <MainCtaButton
              type="submit"
              disabled={!canSubmit()}
              loading={loading}
            >
              Suivant
            </MainCtaButton>
          </Box>
        </form>
      </Container>
    </FunnelModal>
  );
}
