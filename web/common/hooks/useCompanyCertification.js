import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { CertificationImage, getFrenchMedalLabel } from "../certification";

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

  const _CertificationImage = ({ ...props }) => (
    <CertificationImage medal={medal} {...props} />
  );

  return {
    medal,
    isCertified,
    frenchMedalLabel,
    TextBadge,
    CertificationImage: _CertificationImage
  };
};
