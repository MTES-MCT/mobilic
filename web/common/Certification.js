import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

const getFrenchMedalName = medal => {
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

export const TextBadge = ({ medal }) => {
  return (
    <Badge
      severity="new"
      noIcon
      small
      style={{ color: "#716043", backgroundColor: "#FEF6E3" }}
    >
      Certifiée {getFrenchMedalName(medal)}
    </Badge>
  );
};
