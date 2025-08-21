import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useCompanyCertification } from "../../../common/hooks/useCompanyCertification";
import { renderBadge } from "../../../common/certification";

const CERTIFICATE_LEVELS = {
  BRONZE: { label: "Bronze" },
  SILVER: { label: "Argent" },
  GOLD: { label: "Or" },
  DIAMOND: { label: "Diamant" }
};

export default function CertificateFriseBadges({
  companyWithInfo,
  onDownloadCertificate = null
}) {
  const { medal, frenchMedalLabel, isCertified } = useCompanyCertification(
    companyWithInfo.currentCompanyCertification
  );

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
            {isCertified ? (
              <>
                {companyWithInfo?.name || "Votre entreprise"} est certifiée{" "}
                <b>{frenchMedalLabel}</b> sur Mobilic !
              </>
            ) : (
              `Votre entreprise ${companyWithInfo?.name ||
                ""} n'est pas encore certifiée.`
            )}
          </p>
        </div>

        <div style={{ flex: "none" }}>
          <Button
            priority="secondary"
            size="medium"
            onClick={isCertified ? onDownloadCertificate : undefined}
            disabled={!isCertified}
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
        {Object.keys(CERTIFICATE_LEVELS).map(m =>
          renderBadge(medal, medal === m)
        )}
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
