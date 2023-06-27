import React, { useMemo } from "react";
import { useApi } from "common/utils/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  COMPANY_CERTIFICATION_COMMUNICATION_QUERY,
  EDIT_COMPANIES_COMMUNICATION_SETTING
} from "common/utils/apiQueries";
import { usePanelStyles } from "../Company";
import { Link } from "../../../common/LinkButton";
import Skeleton from "@mui/material/Skeleton";
import { CheckboxField } from "../../../common/CheckboxField";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { getMonthsBetweenTwoDates } from "common/utils/time";
import Alert from "@mui/material/Alert";
import CertificationCriteriaGlobalResult from "./CertificationCriteriaGlobalResult";

export default function CertificationPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const classes = usePanelStyles();
  const [companyWithInfo, setCompanyWithInfo] = React.useState({});
  const [
    acceptCertificationCommunication,
    setAcceptCertificationCommunication
  ] = React.useState(null);
  const [loadingInfo, setLoadingInfo] = React.useState(true);

  React.useEffect(async () => {
    setLoadingInfo(true);
    const apiResponse = await api.graphQlQuery(
      COMPANY_CERTIFICATION_COMMUNICATION_QUERY,
      {
        companyId: company.id
      }
    );
    setCompanyWithInfo(apiResponse?.data?.company);
    setAcceptCertificationCommunication(
      apiResponse?.data?.company?.acceptCertificationCommunication
    );
    setLoadingInfo(false);
  }, [company]);

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
    if (loadingInfo) {
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

  return [
    <Box key={3} className={classes.title}>
      <Typography variant="h4" mb={1}>
        {panelTitle}
      </Typography>
    </Box>,
    loadingInfo && (
      <Skeleton key={2} variant="rectangular" width="100%" height={100} />
    ),
    !loadingInfo && (
      <Box key={8} mb={2}>
        <Typography mb={2}>
          Le certificat, fourni par l'équipe Mobilic, atteste du fait qu'une
          entreprise se plie à la réglementation de suivi du temps de travail
          et, pour cela, utilise Mobilic de manière conforme. L'attestation est
          valable pour une durée de 6 mois.
        </Typography>
        <Alert severity="warning">
          Attention, le certificat Mobilic n'est en aucun cas un gage de respect
          total de la réglementation par l'entreprise. Il n'atteste que de la
          bonne utilisation de l'outil de suivi du temps de travail.
        </Alert>
      </Box>
    ),
    !loadingInfo && companyWithInfo.isCertified && (
      <Box key={5}>
        <CheckboxField
          mt={2}
          checked={acceptCertificationCommunication}
          onChange={() =>
            changeCommunicationSetting(!acceptCertificationCommunication)
          }
          label={`J'accepte que Mobilic communique sur le fait que l'entreprise ${companyWithInfo.name} soit certifiée, notamment auprès des plateformes de mise en relation entre entreprises et particuliers.`}
        />
      </Box>
    ),
    <Typography key={10} mt={2}>
      <Link
        href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Qu'est-ce que le certificat Mobilic ?
      </Link>
    </Typography>,
    companyWithInfo?.certificateCriterias && (
      <CertificationCriteriaGlobalResult companyWithInfo={companyWithInfo} />
    )
  ];
}
