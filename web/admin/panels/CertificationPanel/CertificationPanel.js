import React, { useMemo, useState } from "react";
import { useApi } from "common/utils/api";
import { useCertificationInfo } from "../../utils/certificationInfo";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  EDIT_COMPANIES_COMMUNICATION_SETTING,
  HTTP_QUERIES
} from "common/utils/apiQueries";
import { usePanelStyles } from "../Company";
import { Link } from "../../../common/LinkButton";
import Skeleton from "@mui/material/Skeleton";
import { CheckboxField } from "../../../common/CheckboxField";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { getMonthsBetweenTwoDates } from "common/utils/time";
import CertificationCriteriaGlobalResult from "./CertificationCriteriaGlobalResult";
import RegulatoryThresholdsPanel from "./RegulatoryThresholdsPanel";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { makeStyles } from "@mui/styles";
import Notice from "../../../common/Notice";
import { TAB_LABELS } from "./regulatoryThresholdConstants";

// Custom navigation bar with SideMenu coherence and responsive spacing
const useNavigationStyles = makeStyles(theme => ({
  navigationContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    marginBottom: theme.spacing(5) // Increased spacing between navigation and content
  },
  navigationBar: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(3), // 24px equivalent
    padding: `0 ${theme.spacing(0.5)} 0 0` // 4px equivalent
  },
  navigationItem: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "Marianne, arial, sans-serif",
    fontSize: theme.typography.body2.fontSize, // Responsive font size
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: 400,
    color: theme.palette.text.primary,
    textDecoration: "none",
    position: "relative",
    "&:hover": {
      backgroundColor: "transparent"
    }
  },
  navigationItemActive: {
    fontWeight: 500,
    color: theme.palette.primary.main,
    background: `linear-gradient(to bottom, transparent, transparent calc(100% - 5px), ${theme.palette.primary.main} calc(100% - 5px), ${theme.palette.primary.main})`
  }
}));

export default function CertificationPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const classes = usePanelStyles();
  const navClasses = useNavigationStyles();
  const { companyWithInfo, loadingInfo } = useCertificationInfo();

  // Tab state
  const [activeTab, setActiveTab] = useState("criteria");

  const [
    acceptCertificationCommunication,
    setAcceptCertificationCommunication
  ] = React.useState(null);

  React.useEffect(() => {
    setAcceptCertificationCommunication(
      companyWithInfo.acceptCertificationCommunication
    );
  }, [companyWithInfo]);

  const nbMonthSinceLastCertification = useMemo(() => {
    if (companyWithInfo?.lastDayCertified) {
      return getMonthsBetweenTwoDates(
        new Date(companyWithInfo?.lastDayCertified),
        new Date()
      );
    }
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

  const panelTitle = useMemo(() => {
    if (loadingInfo || !companyWithInfo?.certificateCriterias) {
      return "Certificat Mobilic";
    } else if (companyWithInfo.isCertified) {
      const nbMonthCertified =
        getMonthsBetweenTwoDates(
          new Date(companyWithInfo?.startLastCertificationPeriod),
          new Date()
        ) + 1;
      return `Certificat Mobilic : Félicitations, votre entreprise est certifiée depuis ${nbMonthCertified} mois.`;
    } else {
      return companyWithInfo.lastDayCertified
        ? `Certificat Mobilic : Votre entreprise ${companyWithInfo.name} n'est plus certifiée depuis ${nbMonthSinceLastCertification} mois`
        : `Certificat Mobilic : Votre entreprise ${companyWithInfo.name} n'est pas encore certifiée.`;
    }
  }, [loadingInfo, companyWithInfo.isCertified, nbMonthSinceLastCertification]);

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

  // Check if regulatory data should be available
  const hasRegulatoryDataAvailable = useMemo(() => {
    return !loadingInfo && companyWithInfo && !companyWithInfo.hasNoActivity;
  }, [loadingInfo, companyWithInfo]);

  // Loading state
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
      <Box className={classes.title}>
        <Typography variant="h4" component="h2">
          {panelTitle}
        </Typography>
        {companyWithInfo.isCertified && (
          <Button
            priority="secondary"
            iconId="fr-icon-download-fill"
            iconPosition="left"
            onClick={async () =>
              alerts.withApiErrorHandling(async () => {
                const options = {
                  company_id: company.id
                };
                await api.downloadFileHttpQuery(
                  HTTP_QUERIES.downloadCertificate,
                  {
                    json: options
                  }
                );
              }, "download-certificate")
            }
          >
            Télécharger le certificat
          </Button>
        )}
      </Box>

      {noCertificateText && (
        <Box mb={2}>
          <Typography variant="h6" component="span">
            {noCertificateText}
          </Typography>
        </Box>
      )}

      <Box mb={2}>
        <Typography mb={2}>
          Le certificat, fourni par l'équipe Mobilic, atteste du fait qu'une
          entreprise se plie à la réglementation de suivi du temps de travail
          et, pour cela, utilise Mobilic de manière conforme. L'attestation est
          valable pour une durée de 6 mois.
        </Typography>
        <Notice
          type="warning"
          description="Attention, le certificat Mobilic n'est en aucun cas un gage de respect
          total de la réglementation par l'entreprise. Il n'atteste que de la
          bonne utilisation de l'outil de suivi du temps de travail."
        />
      </Box>

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

      <Typography mt={2}>
        <Link
          href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Qu'est-ce que le certificat Mobilic ?
        </Link>
      </Typography>

      {companyWithInfo && (
        <div className={cx(fr.cx("fr-mt-4w"))}>
          <div className={navClasses.navigationContainer}>
            <div className={navClasses.navigationBar}>
              <button
                className={cx(
                  navClasses.navigationItem,
                  activeTab === "criteria"
                    ? navClasses.navigationItemActive
                    : ""
                )}
                onClick={() => setActiveTab("criteria")}
                type="button"
                aria-pressed={activeTab === "criteria"}
              >
                {TAB_LABELS.criteria}
              </button>
              <button
                className={cx(
                  navClasses.navigationItem,
                  activeTab === "thresholds"
                    ? navClasses.navigationItemActive
                    : ""
                )}
                onClick={() => setActiveTab("thresholds")}
                type="button"
                aria-pressed={activeTab === "thresholds"}
                disabled={!hasRegulatoryDataAvailable}
                style={{
                  opacity: !hasRegulatoryDataAvailable ? 0.5 : 1,
                  cursor: !hasRegulatoryDataAvailable
                    ? "not-allowed"
                    : "pointer"
                }}
              >
                {TAB_LABELS.thresholds}
              </button>
            </div>
          </div>

          <div style={{ width: "100%" }}>
            {activeTab === "criteria" && (
              <div role="tabpanel" aria-labelledby="criteria-tab">
                <CertificationCriteriaGlobalResult
                  companyWithInfo={companyWithInfo}
                />
              </div>
            )}

            {activeTab === "thresholds" && hasRegulatoryDataAvailable && (
              <div role="tabpanel" aria-labelledby="thresholds-tab">
                <RegulatoryThresholdsPanel companyWithInfo={companyWithInfo} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
