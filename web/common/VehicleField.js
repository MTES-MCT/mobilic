import React from "react";
import TextField from "common/utils/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { getVehicleName } from "common/utils/vehicles";
import KilometerReadingField from "./KilometerReadingField";

export function VehicleField({
  label,
  vehicle,
  setVehicle,
  vehicles,
  allowCreate = true,
  disabled = false,
  className = null,
  kilometerReading = "",
  setKilometerReading = null,
  fullWidth = false,
  ...other
}) {
  const _filterOptions = createFilterOptions({ stringify: getVehicleName });
  const filterOptions = (options, other) =>
    _filterOptions(options, { inputValue: getVehicleName(vehicle) || "" });

  React.useEffect(() => {
    if (setKilometerReading) {
      if (vehicle.lastKilometerReading) {
        setKilometerReading(vehicle.lastKilometerReading);
      } else {
        setKilometerReading("");
      }
    }
  }, [vehicle]);

  return [
    <Autocomplete
      id="vehicle-booking"
      fullWidth={fullWidth}
      key={0}
      className={className}
      freeSolo={allowCreate}
      disabled={disabled}
      options={vehicles}
      getOptionLabel={v => getVehicleName(v)}
      value={vehicle}
      filterOptions={filterOptions}
      onInputChange={(event, value, reason) => {
        if (reason === "clear") setVehicle(null);
        else {
          const newVehicleName = value;
          const vehicleMatch = vehicles.find(
            v =>
              v.name === newVehicleName ||
              v.registrationNumber === newVehicleName
          );
          if (vehicleMatch) setVehicle(vehicleMatch);
          else setVehicle({ registrationNumber: newVehicleName });
        }
      }}
      renderInput={params => (
        <TextField
          {...params}
          variant="filled"
          label={label}
          placeholder="Véhicule"
          {...other}
        />
      )}
    />,
    setKilometerReading && (
      <KilometerReadingField
        key={1}
        size="small"
        kilometerReading={kilometerReading}
        setKilometerReading={setKilometerReading}
      />
    )
  ];
}
