import React from "react";
import Dialog from "@material-ui/core/Dialog";
import { formatPersonName } from "common/utils/coworkers";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import DialogContent from "@material-ui/core/DialogContent";
import { formatTimer, now } from "common/utils/time";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { CustomDialogTitle } from "../../common/CustomDialogTitle";
import { VehicleInput } from "./VehicleInput";
import Box from "@material-ui/core/Box";

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
    setKilometerReading(null);
  }, [open, currentDriverId]);

  React.useEffect(() => {
    if (!vehicle) setKilometerReading(null);
  }, [vehicle]);

  const hasTeamMates = team.length > 1;
  return (
    <Dialog onClose={handleClose} open={open}>
      {requireVehicle && [
        <CustomDialogTitle
          title="Quel véhicule utilisez-vous ?"
          handleClose={handleClose}
          key={0}
        />,
        <Box key={1} px={3} pb={3}>
          <VehicleInput
            label="Véhicule"
            vehicle={vehicle}
            setVehicle={setVehicle}
            companyId={company ? company.id : null}
            key={1}
            kilometerReading={kilometerReading}
            setKilometerReading={
              company && company.requireKilometerData && vehicle
                ? setKilometerReading
                : null
            }
          />
        </Box>
      ]}
      <CustomDialogTitle
        title={
          hasTeamMates ? "Choisir conducteur" : "Êtes-vous le conducteur ?"
        }
        handleClose={requireVehicle ? null : handleClose}
      />
      <DialogContent>
        <RadioGroup
          aria-label="driver"
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
              control={<Radio />}
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
            control={<Radio />}
            label={hasTeamMates ? "Une autre personne" : "Non"}
            disabled={requireVehicle && !vehicle}
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}
