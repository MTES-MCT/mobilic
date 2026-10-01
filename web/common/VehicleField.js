import React from "react";
import values from "lodash/values";
import TextField from "common/utils/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { getSanitizedVehicleName, getVehicleName } from "common/utils/vehicles";
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
  const _filterOptions = createFilterOptions({
    stringify: option => getSanitizedVehicleName(option)
  });
  const filterOptions = (options, other) =>
    _filterOptions(options, {
      inputValue: getSanitizedVehicleName(vehicle) || ""
    });

  const sortedVehicles = React.useMemo(
    () =>
      values(vehicles).sort((a, b) =>
        getVehicleName(a, true).localeCompare(getVehicleName(b, true), "fr", {
          numeric: true
        })
      ),
    [vehicles]
  );

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
      options={sortedVehicles}
      getOptionLabel={v => getVehicleName(v, true)}
      value={vehicle}
      filterOptions={filterOptions}
      onInputChange={(event, value, reason) => {
        if (reason === "clear") setVehicle(null);
        else {
          const newVehicleName = value;
          const vehicleMatch = vehicles.find(
            v =>
              v.name === newVehicleName ||
              v.registrationNumber === newVehicleName ||
              getSanitizedVehicleName(v) ===
                getSanitizedVehicleName({ registrationNumber: newVehicleName })
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
