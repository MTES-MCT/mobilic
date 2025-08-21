import React from "react";
import _CertificationSquareBronze from "common/assets/images/certification/squared/bronze.png";
import _CertificationSquareArgent from "common/assets/images/certification/squared/argent.png";
import _CertificationSquareOr from "common/assets/images/certification/squared/or.png";
import _CertificationSquareDiamant from "common/assets/images/certification/squared/diamant.png";
import _CertificationBannerBronze from "common/assets/images/certification/banner/bronze.png";
import _CertificationBannerArgent from "common/assets/images/certification/banner/argent.png";
import _CertificationBannerOr from "common/assets/images/certification/banner/or.png";
import _CertificationBannerDiamant from "common/assets/images/certification/banner/diamant.png";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { useIsWidthDown } from "common/utils/useWidth";

const getSquaredImage = medal => {
  switch (medal) {
    case "BRONZE":
      return _CertificationSquareBronze;
    case "SILVER":
      return _CertificationSquareArgent;
    case "GOLD":
      return _CertificationSquareOr;
    case "DIAMOND":
      return _CertificationSquareDiamant;
    default:
      return "";
  }
};

const getBannerImage = medal => {
  switch (medal) {
    case "BRONZE":
      return _CertificationBannerBronze;
    case "SILVER":
      return _CertificationBannerArgent;
    case "GOLD":
      return _CertificationBannerOr;
    case "DIAMOND":
      return _CertificationBannerDiamant;
    default:
      return "";
  }
};

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

export const CertificationImage = ({
  medal,
  forcedSquare = false,
  ...props
}) => {
  const isMobile = useIsWidthDown("sm");
  console.log("medal", medal);
  return (
    <img
      alt="Certificat"
      src={
        isMobile || forcedSquare
          ? getSquaredImage(medal)
          : getBannerImage(medal)
      }
      style={{ width: "100%", height: "auto" }}
      {...props}
    />
  );
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
