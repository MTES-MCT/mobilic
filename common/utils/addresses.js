export function formatAddressMainText(address) {
  return address.properties
    ? address.properties.name
    : address.alias
    ? `${address.alias} (${address.name})`
    : address.name;
}

export function formatAddressSubText(address) {
  return address.properties
    ? `${address.properties.postcode} ${address.properties.city}`
    : address.postalCode
    ? `${address.postalCode} ${address.city}`
    : null;
}

export function buildBackendPayloadForAddress(address) {
  if (address.id) return { companyKnownAddressId: address.id };
  else if (address.manual || typeof address === "string")
    return { manualAddress: address.name };
  else return { geoApiData: address };
}
