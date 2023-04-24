import React, { useMemo } from "react";
import { useApi } from "common/utils/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  COMPANY_CERTIFICATION_COMMUNICATION_QUERY,
  EDIT_COMPANIES_COMMUNICATION_SETTING
} from "common/utils/apiQueries";
import { usePanelStyles } from "./Company";
import { Link } from "../../common/LinkButton";
import Skeleton from "@mui/material/Skeleton";
import { CheckboxField } from "../../common/CheckboxField";
import { useSnackbarAlerts } from "../../common/Snackbar";

export default function CertificationPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
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

  const classes = usePanelStyles();
  const noCertifiedText = useMemo(
    () =>
      companyWithInfo.lastDayCertified
        ? `Votre entreprise ${companyWithInfo.name} n'est plus certifiée.`
        : `Votre entreprise ${companyWithInfo.name} n'est pas certifiée.`,
    [companyWithInfo]
  );

  return [
    <Box key={3} className={classes.title}>
      <Typography variant="h4" mb={1}>
        Certificat Mobilic
      </Typography>
    </Box>,
    loadingInfo && (
      <Skeleton key={2} variant="rectangular" width="100%" height={100} />
    ),
    !loadingInfo && !companyWithInfo.isCertified && (
      <Box key={4}>
        <Typography>{noCertifiedText}</Typography>
      </Box>
    ),
    !loadingInfo && companyWithInfo.isCertified && (
      <Box key={5}>
        <CheckboxField
          checked={acceptCertificationCommunication}
          onChange={() =>
            changeCommunicationSetting(!acceptCertificationCommunication)
          }
          label={`J'accepte que Mobilic communique sur le fait que l'entreprise ${companyWithInfo.name} soit certifiée, notamment auprès des plateformes de mise en relation entre entreprises et particuliers.`}
        />
      </Box>
    ),
    <Typography key={6} mt={1}>
      <Link
        href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Qu'est-ce que le certificat Mobilic ?
      </Link>
    </Typography>
  ];
}
