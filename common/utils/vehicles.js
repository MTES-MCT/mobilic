import { formatTimeOfDay } from "./time";
import { getTime } from "./events";

export function resolveVehicle(vehicleBooking, store) {
  if (!vehicleBooking) return null;
  if (!vehicleBooking.vehicleId) {
    return { registrationNumber: vehicleBooking.registrationNumber };
  }
  return store.getEntity("vehicles")[vehicleBooking.vehicleId.toString()];
}

export function getVehicleName(vehicle, withRegistrationNumber = false) {
  return vehicle
    ? vehicle.name
      ? withRegistrationNumber && vehicle.name !== vehicle.registrationNumber
        ? `${vehicle.name} (${vehicle.registrationNumber})`
        : vehicle.name
      : vehicle.registrationNumber
    : "";
}

export function formatVehicleBookingTimes(vehicleBooking, endTime) {
  if (endTime) {
    return `utilisé de ${formatTimeOfDay(
      getTime(vehicleBooking)
    )} à ${formatTimeOfDay(endTime)}`;
  }
  return `utilisé depuis ${formatTimeOfDay(getTime(vehicleBooking))}`;
}
