import React, { useMemo, useState } from "react";
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
import CertificateBadgeEmbedModal from "./CertificateBadgeEmbedModal";
import { useCompanyCertification } from "../../../common/hooks/useCompanyCertification";
import { CertificationAdvices } from "./CertificationAdvices";
import { Stack } from "@mui/material";

export default function CertificationPanel() {
  const { companyWithInfo, loadingInfo } = useCertificationInfo();
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const { isCertified, medal } = useCompanyCertification(
    companyWithInfo.currentCompanyCertification
  );

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

      <Box sx={{ p: 1 }} maxWidth="1200px">
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
          <Stack
            direction="column"
            mt={6}
            rowGap={6}
            mx={{ xs: 2, lg: 3, xl: 16 }}
            mb={6}
          >
            {!isCertified && (
              <CertificationAdvices medal={medal} isCertified={isCertified} />
            )}
            <CertificateCriteriaTable companyWithInfo={companyWithInfo} />
            {!loadingInfo &&
              companyWithInfo &&
              !companyWithInfo.hasNoActivity && (
                <RegulatoryThresholdsPanel companyWithInfo={companyWithInfo} />
              )}
            {isCertified && (
              <CertificationAdvices medal={medal} isCertified={isCertified} />
            )}
            <Notice
              type="warning"
              description="Attention, le certificat Mobilic n'est en aucun cas un gage de respect total de la réglementation par l'entreprise. Il n'atteste que de la bonne utilisation de l'outil de suivi du temps de travail."
              isFullWidth={true}
              sx={{
                textAlign: "justify"
              }}
            />
          </Stack>
        )}
      </Box>
      <CertificateBadgeEmbedModal
        open={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        companyWithInfo={companyWithInfo}
      />
    </Box>
  );

  function handleDownloadCertificate() {
    setBadgeModalOpen(true);
  }
}
