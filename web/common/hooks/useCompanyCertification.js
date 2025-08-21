export const getFrenchMedalLabel = medal => {
  switch (medal) {
    case "BRONZE":
      return "bronze";
    case "SILVER":
      return "argent";
    case "GOLD":
      return "or";
    case "DIAMOND":
      return "diamant";
    default:
      return "";
  }
};

export const useCompanyCertification = companyCertification => {
  const { certificationMedal: medal, isCerfified } = companyCertification;

  const frenchMedalLabel = getFrenchMedalLabel(medal);

  return {
    medal,
    isCerfified,
    frenchMedalLabel
  };
};
