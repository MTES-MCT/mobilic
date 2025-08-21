import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

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
  const { certificationMedal: medal, isCertified } = companyCertification;

  const frenchMedalLabel = getFrenchMedalLabel(medal);

  const TextBadge = () => {
    return (
      <Badge
        severity="new"
        noIcon
        small
        style={{ color: "#716043", backgroundColor: "#FEF6E3" }}
      >
        Certifiée {frenchMedalLabel}
      </Badge>
    );
  };

  return {
    medal,
    isCertified,
    frenchMedalLabel,
    TextBadge
  };
};
