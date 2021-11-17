import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import values from "lodash/values";
import { VehicleField } from "../../common/VehicleField";

export function VehicleFieldForApp({
  label,
  vehicle,
  setVehicle,
  companyId = null,
  disabled = false,
  className = null,
  kilometerReading = null,
  setKilometerReading = null,
  ...other
}) {
  const store = useStoreSyncedWithLocalStorage();

  let vehicles = values(store.getEntity("vehicles"));
  if (companyId) vehicles = vehicles.filter(v => v.companyId === companyId);

  return (
    <VehicleField
      label={label}
      vehicle={vehicle}
      setVehicle={setVehicle}
      vehicles={vehicles}
      disabled={disabled}
      className={className}
      kilometerReading={kilometerReading}
      setKilometerReading={setKilometerReading}
      {...other}
    />
  );
}
