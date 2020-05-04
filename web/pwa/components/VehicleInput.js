import React from "react";
import TextField from "@material-ui/core/TextField";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { getVehicleName } from "common/utils/vehicles";

export function VehicleInput({ label, vehicle, setVehicle }) {
  const store = useStoreSyncedWithLocalStorage();

  const vehicles = store.vehicles();
  const _filterOptions = createFilterOptions({ stringify: getVehicleName });
  const filterOptions = (options, other) =>
    _filterOptions(options, { inputValue: getVehicleName(vehicle) || "" });

  return (
    <Autocomplete
      id="vehicle-booking"
      style={{ width: "100%" }}
      freeSolo
      options={vehicles}
      getOptionLabel={getVehicleName}
      value={vehicle}
      filterOptions={filterOptions}
      onInputChange={(event, value) => {
        const newVehicleName = value;
        const vehicleMatch = vehicles.find(
          v =>
            v.name === newVehicleName || v.registrationNumber === newVehicleName
        );
        if (vehicleMatch) setVehicle(vehicleMatch);
        else setVehicle({ registrationNumber: newVehicleName });
      }}
      renderInput={params => (
        <TextField
          {...params}
          variant="filled"
          label={label}
          placeholder="Véhicule"
        />
      )}
    />
  );
}
