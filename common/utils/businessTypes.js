export const BUSINESS_TYPES = [
  {
    value: "LONG_DISTANCE",
    label: "TRM - Longue distance"
  },
  {
    value: "SHORT_DISTANCE",
    label: "TRM - Courte distance"
  },
  {
    value: "SHIPPING",
    label: "TRM - Messagerie, Fonds et valeur"
  },
  {
    value: "FREQUENT",
    label: "TRV - Lignes régulières"
  },
  {
    value: "INFREQUENT",
    label: "TRV - Occasionnels"
  }
];

export const formatActivity = business => {
  if (!business) {
    return "";
  }
  const { transportType, businessType } = business;
  if (!transportType || !businessType) {
    return "";
  }
  return BUSINESS_TYPES.filter(b => b.value === businessType)[0].label;
};
