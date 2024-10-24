import React from "react";
import { formatPersonName } from "common/utils/coworkers";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { formatTimer, now } from "common/utils/time";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Box from "@mui/material/Box";
import { VehicleFieldForApp } from "../components/VehicleFieldForApp";
import Modal from "../../common/Modal";
import FormLabel from "@mui/material/FormLabel";

export default function DriverSelectionModal({
  team = [],
  open,
  requireVehicle = false,
  company = null,
  currentDriverId = undefined,
  currentDriverStartTime = null,
  handleClose,
  handleDriverSelection
}) {
  const store = useStoreSyncedWithLocalStorage();
  const coworkers = store.getEntity("coworkers");

  const [vehicle, setVehicle] = React.useState(null);
  const [kilometerReading, setKilometerReading] = React.useState(null);
  const [selected, setSelected] = React.useState(null);

  React.useEffect(() => {
    setSelected(null);
    setKilometerReading("");
  }, [open, currentDriverId]);

  React.useEffect(() => {
    if (!vehicle) setKilometerReading("");
  }, [vehicle]);

  const hasTeamMates = team.length > 1;
  return (
    <Modal
      title="Informations requises"
      size="sm"
      open={open}
      handleClose={handleClose}
      content={
        <>
          {requireVehicle && (
            <Box px={3} pb={3}>
              <FormLabel
                id="choose-vehicle-label"
                sx={{ fontSize: "1.15rem", fontWeight: 600 }}
              >
                Quel véhicule utilisez-vous ?
              </FormLabel>
              <VehicleFieldForApp
                sx={{ marginTop: 1 }}
                aria-labelledby="choose-vehicle-label"
                label="Véhicule ?"
                fullWidth
                required
                vehicle={vehicle}
                setVehicle={setVehicle}
                companyId={company ? company.id : null}
                key={1}
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
            </Box>
          )}
          <Box px={3} pb={3}>
            <FormLabel
              id="choose-driver-group-label"
              sx={{ fontSize: "1.15rem", fontWeight: 600 }}
            >
              {hasTeamMates
                ? "Choisir conducteur"
                : "Êtes-vous le conducteur ?"}
            </FormLabel>
            <RadioGroup
              sx={{ marginTop: 1 }}
              aria-labelledby="choose-driver-group-label"
              name="driver"
              value={selected || team.findIndex(id => id === currentDriverId)}
              onChange={async e => {
                const value = parseInt(e.target.value);
                setSelected(value);
                await new Promise(resolve => setTimeout(resolve, 100));
                await handleDriverSelection(value, vehicle, kilometerReading);
                handleClose();
              }}
            >
              {team.map((teamMateId, index) => (
                <FormControlLabel
                  key={index}
                  value={teamMateId}
                  control={<Radio color="secondary" />}
                  label={
                    hasTeamMates
                      ? `${
                          teamMateId === store.userId()
                            ? formatPersonName(store.userInfo())
                            : coworkers[teamMateId.toString()]
                            ? formatPersonName(coworkers[teamMateId.toString()])
                            : "Inconnu"
                        }${
                          currentDriverId && teamMateId === currentDriverId
                            ? ` (conduit depuis ${formatTimer(
                                now() - currentDriverStartTime
                              )})`
                            : ""
                        }`
                      : "Oui"
                  }
                  checked={currentDriverId && teamMateId === currentDriverId}
                  disabled={
                    (requireVehicle && !vehicle) ||
                    (currentDriverId && teamMateId === currentDriverId)
                  }
                />
              ))}
              <FormControlLabel
                key={-1}
                value={-2}
                control={<Radio color="secondary" />}
                label={hasTeamMates ? "Une autre personne" : "Non"}
                disabled={requireVehicle && !vehicle}
              />
            </RadioGroup>
          </Box>
        </>
      }
    />
  );
}
