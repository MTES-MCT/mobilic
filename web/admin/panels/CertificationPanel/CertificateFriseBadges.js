import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";

import { ReactComponent as BronzeActiveBadge } from "common/assets/images/certificat/Frise-item-clique/bronze_active_badge.svg";
import { ReactComponent as BronzeBadge } from "common/assets/images/certificat/Frise-item-desactive/bronze_badge.svg";
import { ReactComponent as ArgentActiveBadge } from "common/assets/images/certificat/Frise-item-clique/argent_active_badge.svg";
import { ReactComponent as ArgentBadge } from "common/assets/images/certificat/Frise-item-desactive/argent_badge.svg";
import { ReactComponent as OrActiveBadge } from "common/assets/images/certificat/Frise-item-clique/or_active_badge.svg";
import { ReactComponent as OrBadge } from "common/assets/images/certificat/Frise-item-desactive/or_badge.svg";
import { ReactComponent as DiamantActiveBadge } from "common/assets/images/certificat/Frise-item-clique/diamant_active_badge.svg";
import { ReactComponent as DiamantBadge } from "common/assets/images/certificat/Frise-item-desactive/diamant_badge.svg";

const CERTIFICATE_LEVELS = {
  BRONZE: { label: "Bronze" },
  ARGENT: { label: "Argent" },
  OR: { label: "Or" },
  DIAMANT: { label: "Diamant" }
};

const BADGE_COMPONENTS = {
  BRONZE: {
    inactive: BronzeBadge,
    active: BronzeActiveBadge
  },
  ARGENT: {
    inactive: ArgentBadge,
    active: ArgentActiveBadge
  },
  OR: {
    inactive: OrBadge,
    active: OrActiveBadge
  },
  DIAMANT: {
    inactive: DiamantBadge,
    active: DiamantActiveBadge
  }
};

export default function CertificateFriseBadges({
  companyWithInfo,
  onDownloadCertificate = null
}) {
  const achievedLevel =
    companyWithInfo?.currentCompanyCertification?.certificationMedal;

  const renderBadgeItem = level => {
    const isAchieved = achievedLevel === level;
    const BadgeComponent =
      BADGE_COMPONENTS[level]?.[isAchieved ? "active" : "inactive"];

    if (!BadgeComponent) {
      return null;
    }

    return (
      <div
        key={level}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: isAchieved ? "none" : 1,
          minHeight: "96px"
        }}
      >
        <BadgeComponent
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100%",
            filter: isAchieved
              ? "drop-shadow(0px 6px 0px rgba(0, 0, 0, 0.25))"
              : "none"
          }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignSelf: "stretch",
        gap: "24px",
        padding: "0px 0px 32px 0px",
        backgroundColor: "#F6F6F6"
      }}
    >
      <div
        style={{
          display: "flex",
          alignSelf: "stretch",
          gap: "10px",
          padding: "32px 40px 0px 40px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1
          }}
        >
          <h1
            style={{
              fontFamily: "Marianne",
              fontWeight: 700,
              fontSize: "28px",
              lineHeight: "1.29em",
              color: "#161616",
              margin: 0
            }}
          >
            Certificat
          </h1>
          <p
            style={{
              fontFamily: "Marianne",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "1.5em",
              color: "#3A3A3A",
              margin: 0
            }}
          >
            {achievedLevel
              ? `${companyWithInfo?.name ||
                  "Votre entreprise"} est certifiée ${CERTIFICATE_LEVELS[
                  achievedLevel
                ]?.label.toLowerCase()} sur Mobilic !`
              : `Votre entreprise ${companyWithInfo?.name ||
                  ""} n'est pas encore certifiée.`}
          </p>
        </div>

        <div style={{ flex: "none" }}>
          <Button
            priority="secondary"
            size="medium"
            onClick={achievedLevel ? onDownloadCertificate : undefined}
            disabled={!achievedLevel}
          >
            Afficher le certificat sur mon site internet
          </Button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          alignSelf: "stretch",
          gap: "8px",
          padding: "0px 96px 0px 32px",
          minHeight: "150px",
          justifyContent: "stretch"
        }}
      >
        {Object.keys(CERTIFICATE_LEVELS).map(level => renderBadgeItem(level))}
      </div>

      <div
        style={{
          display: "flex",
          padding: "0px 40px",
          alignSelf: "stretch"
        }}
      >
        <a
          href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "Marianne",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "24px",
            color: "#000091",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Qu'est-ce que le certificat Mobilic ?
        </a>
      </div>
    </div>
  );
}
