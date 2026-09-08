const BUSINESS_TYPES_BY_TRANSPORT = {
  TRM: {
    LONG_DISTANCE: "Longue distance",
    SHORT_DISTANCE: "Courte distance",
    SHIPPING: "Messagerie, Fonds et valeur"
  },
  TRV: {
    FREQUENT: "Lignes régulières",
    INFREQUENT: "Occasionnel",
    TAXI_GENERAL: "Taxi général",
    TAXI_REGULATED: "Taxi conventionné",
    VTC: "VTC",
    LOTI: "LOTI"
  },
  DEM: {
    LONG_DISTANCE: "Longue distance",
    SHORT_DISTANCE: "Courte distance"
  }
};

export const BUSINESS_TYPES = Object.entries(
  BUSINESS_TYPES_BY_TRANSPORT
).flatMap(([transportType, businessTypes]) =>
  Object.entries(businessTypes).map(([value, label]) => ({
    value,
    label: `${transportType} - ${label}`
  }))
);

export const formatActivity = business => {
  if (!business) {
    return "";
  }
  const { transportType, businessType } = business;
  if (!transportType || !businessType) {
    return "";
  }
  const label = BUSINESS_TYPES_BY_TRANSPORT[transportType]?.[businessType];
  return label ? `${transportType} - ${label}` : "";
};
