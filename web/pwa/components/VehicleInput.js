import React from "react";
import values from "lodash/values";
import TextField from "common/utils/TextField";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { getVehicleName } from "common/utils/vehicles";
import KilometerReadingInput from "./KilometerReadingInput";

export function VehicleInput({
  label,
  vehicle,
  setVehicle,
  disabled = false,
  companyId = null,
  className = null,
  kilometerReading = null,
  setKilometerReading = null
}) {
  const store = useStoreSyncedWithLocalStorage();

  let vehicles = values(store.getEntity("vehicles"));
  if (companyId) vehicles = vehicles.filter(v => v.companyId === companyId);
  const _filterOptions = createFilterOptions({ stringify: getVehicleName });
  const filterOptions = (options, other) =>
    _filterOptions(options, { inputValue: getVehicleName(vehicle) || "" });

  return [
    <Autocomplete
      id="vehicle-booking"
      key={0}
      style={{ width: "100%" }}
      className={className}
      freeSolo
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
        />
      )}
    />,
    setKilometerReading && (
      <KilometerReadingInput
        size="small"
        kilometerReading={kilometerReading}
        setKilometerReading={setKilometerReading}
      />
    )
  ];
}
