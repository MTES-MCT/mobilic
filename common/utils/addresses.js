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
    : `${address.postalCode} ${address.city}`;
}
