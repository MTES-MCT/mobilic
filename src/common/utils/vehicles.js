export function resolveVehicle(vehicleBooking, store) {
  if (!vehicleBooking) return null;
  if (!vehicleBooking.vehicleId) {
    return { registrationNumber: vehicleBooking.registrationNumber };
  }
  return store.vehicles().find(v => v.id === vehicleBooking.vehicleId);
}

export function getVehicleName(vehicle) {
  return vehicle ? vehicle.name || vehicle.registrationNumber : "";
}
