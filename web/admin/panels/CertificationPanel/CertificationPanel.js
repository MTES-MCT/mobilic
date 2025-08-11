import React, { useMemo } from "react";
import { useApi } from "common/utils/api";
import { useCertificationInfo } from "../../utils/certificationInfo";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  EDIT_COMPANIES_COMMUNICATION_SETTING,
  HTTP_QUERIES
} from "common/utils/apiQueries";
import { Link } from "../../../common/LinkButton";
import Skeleton from "@mui/material/Skeleton";
import { CheckboxField } from "../../../common/CheckboxField";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import CertificateCriteriaTable from "./CertificateCriteriaTable";
import { useRegulatoryScore } from "./useRegulatoryScore";
import RegulatoryThresholdsPanel from "./RegulatoryThresholdsPanel";
import CertificateFriseBadges from "./CertificateFriseBadges";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Notice from "../../../common/Notice";

export default function CertificationPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { companyWithInfo, loadingInfo } = useCertificationInfo();
  const regulatoryScore = useRegulatoryScore(companyWithInfo?.id);

  const hasBronzeLevel = useMemo(() => {
    if (!companyWithInfo?.certificateCriterias || !regulatoryScore)
      return false;

    const logInRealTime =
      companyWithInfo.certificateCriterias.logInRealTimeScore ?? 0;
    const notTooManyChanges =
      companyWithInfo.certificateCriterias.notTooManyChangesScore ?? 0;

    return !(
      regulatoryScore.compliant < 1 ||
      logInRealTime < 60 ||
      notTooManyChanges > 30
    );
  }, [companyWithInfo, regulatoryScore]);

  const [
    acceptCertificationCommunication,
    setAcceptCertificationCommunication
  ] = React.useState(null);

  React.useEffect(() => {
    setAcceptCertificationCommunication(
      companyWithInfo.acceptCertificationCommunication
    );
  }, [companyWithInfo]);

  async function changeCommunicationSetting(value) {
    await api.graphQlMutate(
      EDIT_COMPANIES_COMMUNICATION_SETTING,
      {
        companyIds: [companyWithInfo.id],
        acceptCertificationCommunication: value
      },
      { context: { nonPublicApi: true } }
    );
    setAcceptCertificationCommunication(value);
    alerts.success(
      "Vos préférences de communication ont bien été prises en compte.",
      "",
      6000
    );
  }

  const handleDownloadCertificate = async () => {
    await alerts.withApiErrorHandling(async () => {
      const options = {
        company_id: company.id
      };
      await api.downloadFileHttpQuery(HTTP_QUERIES.downloadCertificate, {
        json: options
      });
    }, "download-certificate");
  };

  const noCertificateText = useMemo(() => {
    if (loadingInfo) {
      return "";
    }

    if (companyWithInfo?.hasNoActivity) {
      return "Votre entreprise n'est pas encore certifiée car le calcul se fera lorsque vous aurez commencé à enregistrer des activités.";
    }

    if (!companyWithInfo?.certificateCriterias) {
      return "Votre entreprise n'est pas encore certifiée car le calcul de certification se fera au début du mois prochain.";
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
    <div
      style={{
        width: "100%",
        padding: "1rem",
        backgroundColor: "transparent"
      }}
    >
      {/* Certificate Frise Badges - replaces panelTitle selon design Figma */}
      <CertificateFriseBadges
        companyWithInfo={companyWithInfo}
        regulatoryScore={regulatoryScore}
        onDownloadCertificate={handleDownloadCertificate}
      />

      {noCertificateText && (
        <Box mb={2}>
          <Typography variant="h6" component="span">
            {noCertificateText}
          </Typography>
        </Box>
      )}


      {companyWithInfo.isCertified && (
        <Box>
          <CheckboxField
            mt={2}
            checked={acceptCertificationCommunication}
            onChange={() =>
              changeCommunicationSetting(!acceptCertificationCommunication)
            }
            label={`J'accepte que Mobilic communique sur le fait que l'entreprise ${companyWithInfo.name} soit certifiée, notamment auprès des plateformes de mise en relation entre entreprises et particuliers.`}
          />
        </Box>
      )}


      {companyWithInfo && (
        <div className={cx(fr.cx("fr-container", "fr-mt-4w"))}>
          <div className={cx(fr.cx("fr-mb-4w"))}>
            {hasBronzeLevel && (
              <h2
                className={cx(fr.cx("fr-h4"))}
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  lineHeight: "28px",
                  color: "#161616",
                  margin: "0 0 32px 0"
                }}
              >
                Les critères de certification
              </h2>
            )}
            <CertificateCriteriaTable
              companyWithInfo={companyWithInfo}
              regulatoryScore={regulatoryScore}
            />
          </div>

          {!loadingInfo && companyWithInfo && !companyWithInfo.hasNoActivity && (
            <div className={cx(fr.cx("fr-mt-6w"))}>
              <h2
                className={cx(fr.cx("fr-h4"))}
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  lineHeight: "28px",
                  color: "#161616",
                  margin: "0 0 32px 0"
                }}
              >
                Respect des seuils réglementaires
              </h2>
              <RegulatoryThresholdsPanel companyWithInfo={companyWithInfo} />
            </div>
          )}

          <div className={cx(fr.cx("fr-mt-6w"))}>
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
    </div>
  );
}
