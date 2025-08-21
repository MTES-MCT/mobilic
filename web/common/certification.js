import React from "react";
import _CertificationSquareBronze from "common/assets/images/certification/squared/bronze.png";
import _CertificationSquareArgent from "common/assets/images/certification/squared/argent.png";
import _CertificationSquareOr from "common/assets/images/certification/squared/or.png";
import _CertificationSquareDiamant from "common/assets/images/certification/squared/diamant.png";
import _CertificationBannerBronze from "common/assets/images/certification/banner/bronze.png";
import _CertificationBannerArgent from "common/assets/images/certification/banner/argent.png";
import _CertificationBannerOr from "common/assets/images/certification/banner/or.png";
import _CertificationBannerDiamant from "common/assets/images/certification/banner/diamant.png";
import { ReactComponent as BronzeActiveBadge } from "common/assets/images/certification/badge/active/bronze.svg";
import { ReactComponent as BronzeBadge } from "common/assets/images/certification/badge/inactive/bronze.svg";
import { ReactComponent as ArgentActiveBadge } from "common/assets/images/certification/badge/active/argent.svg";
import { ReactComponent as ArgentBadge } from "common/assets/images/certification/badge/inactive/argent.svg";
import { ReactComponent as OrActiveBadge } from "common/assets/images/certification/badge/active/or.svg";
import { ReactComponent as OrBadge } from "common/assets/images/certification/badge/inactive/or.svg";
import { ReactComponent as DiamantActiveBadge } from "common/assets/images/certification/badge/active/diamant.svg";
import { ReactComponent as DiamantBadge } from "common/assets/images/certification/badge/inactive/diamant.svg";
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

export const CertificationImage = ({
  medal,
  forcedSquare = false,
  ...props
}) => {
  const isMobile = useIsWidthDown("sm");
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

const BADGE_COMPONENTS = {
  BRONZE: {
    inactive: BronzeBadge,
    active: BronzeActiveBadge
  },
  SILVER: {
    inactive: ArgentBadge,
    active: ArgentActiveBadge
  },
  GOLD: {
    inactive: OrBadge,
    active: OrActiveBadge
  },
  DIAMOND: {
    inactive: DiamantBadge,
    active: DiamantActiveBadge
  }
};

export const renderBadge = (medal, isActive = false) => {
  const BadgeComponent =
    BADGE_COMPONENTS[medal]?.[isActive ? "active" : "inactive"];

  if (!BadgeComponent) {
    return null;
  }

  return (
    <div
      key={medal}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: isActive ? "none" : 1,
        minHeight: "96px"
      }}
    >
      <BadgeComponent
        style={{
          width: "auto",
          height: "auto",
          maxWidth: "100%"
        }}
      />
    </div>
  );
};
