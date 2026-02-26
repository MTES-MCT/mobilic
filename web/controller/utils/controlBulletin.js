export const CONTROL_BULLETIN_TRANSPORT_TYPE = {
  INTERIEUR: { label: "Intérieur", apiValue: "interieur" },
  INTERNATIONAL: { label: "International", apiValue: "international" },
  CABOTAGE: { label: "Cabotage", apiValue: "cabotage" }
};

export const CONTROL_BULLETIN_VEHICLE_WEIGHT = {
  PV: "PV",
  PTAC: "PTAC",
  REAL: "Poids réel constaté",
}


export const canDownloadBDC = controlData => {
  return (
    !!controlData?.controlBulletin?.locationDepartment &&
    !!controlData?.controlBulletin?.locationCommune &&
    !!controlData?.controlBulletin?.locationLieu &&
    !!controlData?.userFirstName &&
    !!controlData?.userLastName &&
    !!controlData?.controlBulletin?.userBirthDate &&
    !!controlData?.controlBulletin?.userNationality &&
    !!controlData?.controlBulletin?.siren &&
    !!controlData?.companyName &&
    !!controlData?.controlBulletin?.companyAddress &&
    !!controlData?.vehicleRegistrationNumber &&
    !!controlData?.controlBulletin?.vehicleRegistrationCountry &&
    !!controlData?.controlBulletin?.missionAddressBegin &&
    !!controlData?.controlBulletin?.missionAddressEnd &&
    !!controlData?.controlBulletin?.transportType
  );
};

export const checkRequiredFieldStep1 = newControlBulletin => {
  return (
    !!newControlBulletin?.locationCommune &&
    !!newControlBulletin?.locationDepartment &&
    !!newControlBulletin?.locationLieu &&
    !!newControlBulletin?.userFirstName &&
    !!newControlBulletin?.userLastName &&
    !!newControlBulletin?.userBirthDate &&
    !!newControlBulletin?.userNationality
  );
};

export const checkRequiredFieldStep2 = newControlBulletin => {
  return (
    !!newControlBulletin?.companyAddress &&
    !!newControlBulletin?.companyName &&
    !!newControlBulletin?.siren &&
    !!newControlBulletin?.missionAddressBegin &&
    !!newControlBulletin?.missionAddressEnd &&
    !!newControlBulletin?.vehicleRegistrationCountry &&
    !!newControlBulletin?.vehicleRegistrationNumber &&
    !!newControlBulletin?.transportType
  );
};
