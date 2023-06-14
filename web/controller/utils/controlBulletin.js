export const CONTROL_BULLETIN_TRANSPORT_TYPE = {
  INTERIEUR: { label: "Intérieur", apiValue: "interieur" },
  INTERNATIONAL: { label: "International", apiValue: "international" },
  CABOTAGE: { label: "Cabotage", apiValue: "cabotage" }
};

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
