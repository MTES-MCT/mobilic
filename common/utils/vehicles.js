export function getVehicleName(vehicle, withRegistrationNumber = false) {
  return vehicle
    ? vehicle.name
      ? withRegistrationNumber && vehicle.name !== vehicle.registrationNumber
        ? `${vehicle.name} (${vehicle.registrationNumber})`
        : vehicle.name
      : vehicle.registrationNumber
    : "";
}
