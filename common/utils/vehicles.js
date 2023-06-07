export function getVehicleName(vehicle, withRegistrationNumber = false) {
  return vehicle
    ? vehicle.name
      ? withRegistrationNumber && vehicle.name !== vehicle.registrationNumber
        ? `${vehicle.name} (${vehicle.registrationNumber})`
        : vehicle.name
      : vehicle.registrationNumber
    : "";
}

export function getSanitizedVehicleName(vehicle) {
  return getVehicleName(vehicle, true)?.replace(/[ |-]/g, "");
}
