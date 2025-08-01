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
import Notice from "../../../common/Notice";
import { makeStyles } from "@mui/styles";
import { TAB_LABELS } from "./regulatoryThresholdConstants";

const useNavStyles = makeStyles(() => ({
  horizontalNav: {
    "& .fr-nav__list": {
      flexDirection: "row",
      borderBottom: "1px solid var(--border-default-grey)"
    },
    "& .fr-nav__item": {
      borderBottom: "2px solid transparent"
    },
    "& .fr-nav__link": {
      borderRadius: "4px 4px 0 0",
      padding: "0.75rem 1.5rem",
      fontWeight: "500",
      position: "relative",

      "&[aria-current=page]": {
        color: "var(--text-active-blue-france)",
        borderBottom: "2px solid var(--border-active-blue-france)",
        backgroundColor: "var(--background-default-grey)"
      },

      "&:not([aria-current=page]):hover": {
        backgroundColor: "var(--background-alt-grey)"
      }
    }
  }
}));

export default function CertificationPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const classes = usePanelStyles();
  const navClasses = useNavStyles();
  const { companyWithInfo, loadingInfo } = useCertificationInfo();

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

  const hasRegulatoryDataAvailable = useMemo(() => {
    return !loadingInfo && companyWithInfo && !companyWithInfo.hasNoActivity;
  }, [loadingInfo, companyWithInfo]);

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
          <nav
            className={cx(fr.cx("fr-nav"), navClasses.horizontalNav)}
            role="navigation"
            aria-label="Navigation des onglets de certification"
          >
            <ul className={cx(fr.cx("fr-nav__list"))}>
              <li className={cx(fr.cx("fr-nav__item"))}>
                <button
                  className={cx(fr.cx("fr-nav__link"))}
                  aria-current={activeTab === "criteria" ? "page" : undefined}
                  onClick={() => setActiveTab("criteria")}
                  type="button"
                >
                  {TAB_LABELS.criteria}
                </button>
              </li>
              <li className={cx(fr.cx("fr-nav__item"))}>
                <button
                  className={cx(fr.cx("fr-nav__link"))}
                  aria-current={activeTab === "thresholds" ? "page" : undefined}
                  onClick={() => setActiveTab("thresholds")}
                  disabled={!hasRegulatoryDataAvailable}
                  type="button"
                >
                  {TAB_LABELS.thresholds}
                </button>
              </li>
            </ul>
          </nav>

          <div className={cx(fr.cx("fr-mt-4w"))}>
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
