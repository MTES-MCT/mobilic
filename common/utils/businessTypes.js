export const BUSINESS_TYPES = [
  {
    id: "LONG_DISTANCE",
    label: "Longue distance"
  },
  {
    id: "SHORT_DISTANCE",
    label: "Courte distance"
  },
  {
    id: "SHIPPING",
    label: "Messagerie, Fonds et valeur"
  },
  {
    id: "FREQUENT",
    label: "Lignes régulières"
  },
  {
    id: "INFREQUENT",
    label: "Occasionnels"
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
  return `${transportType} - ${
    BUSINESS_TYPES.filter(b => b.id === businessType)[0].label
  }`;
};
