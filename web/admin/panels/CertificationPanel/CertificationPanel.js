import React, { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import CertificateCriteriaTable from "./CertificateCriteriaTable";
import RegulatoryThresholdsPanel from "./RegulatoryThresholdsPanel";
import CertificateFriseBadges from "./CertificateFriseBadges";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Notice from "../../../common/Notice";
import { useCertificationInfo } from "../../utils/certificationInfo";

export default function CertificationPanel() {
  const { companyWithInfo, loadingInfo } = useCertificationInfo();

  const isCertified = useMemo(() => {
    if (!companyWithInfo?.currentCompanyCertification?.certificateCriterias)
      return false;

    if (companyWithInfo.currentCompanyCertification?.certificationMedal) {
      return ["BRONZE", "SILVER", "GOLD", "DIAMOND"].includes(
        companyWithInfo.currentCompanyCertification.certificationMedal
      );
    }

    const logInRealTime =
      companyWithInfo.currentCompanyCertification.certificateCriterias
        .logInRealTime ?? 0;
    const adminChanges =
      companyWithInfo.currentCompanyCertification.certificateCriterias
        .adminChanges ?? 1;
    const compliancy =
      companyWithInfo.currentCompanyCertification.certificateCriterias
        .compliancy ?? 0;

    return logInRealTime >= 0.6 && adminChanges <= 0.3 && compliancy >= 1;
  }, [companyWithInfo]);

  const noCertificateText = useMemo(() => {
    if (loadingInfo) {
      return "";
    }

    if (companyWithInfo?.hasNoActivity) {
      return "Votre entreprise n'est pas encore certifiée car le calcul se fera lorsque vous aurez commencé à enregistrer des activités.";
    }

    return "";
  }, [companyWithInfo, loadingInfo]);

  if (loadingInfo) {
    return (
      <div style={{ width: "100%", padding: "1rem" }}>
        <Skeleton variant="rectangular" width="100%" height={100} />
      </div>
    );
  }

  return (
    <Box
      sx={{
        width: "100%"
      }}
    >
      <CertificateFriseBadges
        companyWithInfo={companyWithInfo}
        onDownloadCertificate={handleDownloadCertificate}
      />

      <Box sx={{ p: 1 }}>
        {noCertificateText && (
          <div className={cx(fr.cx("fr-container"))}>
            <div
              className={cx(fr.cx("fr-mb-4w"))}
              style={{ padding: "0px 40px" }}
            >
              <Typography
                variant="h6"
                component="span"
                style={{
                  fontSize: "16px",
                  fontWeight: 400,
                  lineHeight: "24px",
                  color: "#3A3A3A"
                }}
              >
                {noCertificateText}
              </Typography>
            </div>
          </div>
        )}

        {companyWithInfo && (
          <div className={cx(fr.cx("fr-container", "fr-mt-4w"))}>
            <div className={cx(fr.cx("fr-mb-4w"))}>
              {!isCertified && (
                <h2 className={cx(fr.cx("fr-h2", "fr-mb-5w"))}>
                  Les critères de certification
                </h2>
              )}
              {isCertified && (
                <div
                  style={{
                    margin: "0 0 20px 0"
                  }}
                >
                  <h2 className={cx(fr.cx("fr-h2", "fr-mb-2w"))}>
                    Votre niveau de certification
                  </h2>
                  <p
                    style={{
                      fontFamily: "Marianne",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#161616",
                      margin: "0"
                    }}
                  >
                    au 1er{" "}
                    {new Date().toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              )}
              <CertificateCriteriaTable companyWithInfo={companyWithInfo} />
            </div>

            {!loadingInfo && companyWithInfo && !companyWithInfo.hasNoActivity && (
              <div className={cx(fr.cx("fr-mt-6w"))}>
                <RegulatoryThresholdsPanel />
              </div>
            )}

            <div className={cx(fr.cx("fr-mt-3w"))}>
              <Notice
                type="warning"
                description="Attention, le certificat Mobilic n'est en aucun cas un gage de respect total de la réglementation par l'entreprise. Il n'atteste que de la bonne utilisation de l'outil de suivi du temps de travail."
                isFullWidth={true}
                sx={{
                  textAlign: "justify"
                }}
              />
            </div>
          </div>
        )}
      </Box>
    </Box>
  );

  async function handleDownloadCertificate() {
    // TODO
  }
}
