export function canonicalizeRegistrationNumber(value) {
  return (value || "").replace(/[\s-]/g, "").toUpperCase();
}

export function registrationSortKey(vehicle) {
  return canonicalizeRegistrationNumber(vehicle?.registrationNumber);
}

export function formatRegistrationNumber(value) {
  const canonical = canonicalizeRegistrationNumber(value);
  if (!canonical) return value || "";
  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(canonical)) {
    return [
      canonical.slice(0, 2),
      canonical.slice(2, 5),
      canonical.slice(5)
    ].join("-");
  }
  if (/^\d{6,8}$/.test(canonical)) {
    const cut = Math.ceil(canonical.length / 2);
    return `${canonical.slice(0, cut)} ${canonical.slice(cut)}`;
  }
  return canonical;
}

export function getVehicleName(vehicle, withRegistrationNumber = false) {
  if (!vehicle) return "";
  const registrationNumber = formatRegistrationNumber(
    vehicle.registrationNumber
  );
  const alias =
    vehicle.name && vehicle.name !== vehicle.registrationNumber
      ? vehicle.name
      : null;
  if (!alias) return registrationNumber;
  return withRegistrationNumber ? `${alias} (${registrationNumber})` : alias;
}

export function getSanitizedVehicleName(vehicle) {
  return getVehicleName(vehicle, true)?.replace(/[ |-]/g, "");
}
