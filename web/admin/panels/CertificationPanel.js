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
import {
  getMonthsBetweenTwoDates,
  jsToUnixTimestamp,
  prettyFormatDay
} from "common/utils/time";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Grid from "@mui/material/Grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function CertificationPanel({ company }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [companyWithInfo, setCompanyWithInfo] = React.useState({});
  const [
    acceptCertificationCommunication,
    setAcceptCertificationCommunication
  ] = React.useState(null);
  const [loadingInfo, setLoadingInfo] = React.useState(true);
  const [succeededCriterias, setSucceededCriterias] = React.useState([]);
  const [failureCriterias, setFailureCriterias] = React.useState([]);

  const CERTIFICATION_CRITERIAS = {
    beActive: {
      title: "La majorité des salariés inscrits utilisent Mobilic",
      explanation: (
        <span>
          Entreprises de moins de 5 salariés : au moins 50 % des salariés
          inscrits sur Mobilic s'en servent au quotidien (cela signifie que, sur
          une période de 30 jours, ils ont au moins enregistré 2 activités par
          jour pendant 10 jours). <br />
          <br /> Entreprises d'au moins 5 salariés : au moins 60 % des salariés
          inscrits sur Mobilic s'en servent au quotidien.
        </span>
      )
    },
    notTooManyChanges: {
      title: "Validation des saisies sans modifications",
      explanation: (
        <span>
          Le gestionnaire ne doit pas modifier plus de 10 % des activités
          enregistrées par les salariés.
        </span>
      )
    },
    validateRegularly: {
      title: "Validation régulière des saisies des salariés",
      explanation: (
        <span>
          Au moins 65 % des missions doivent être validées par le gestionnaire
          dans les 7 jours suivant leur enregistrement.
        </span>
      )
    },
    logInRealTime: {
      title: "Saisie du temps de travail en temps réel",
      explanation: (
        <span>
          Au moins 65 % des activités enregistrées par les salariés de
          l'entreprise doivent avoir été lancées dans les 60 minutes suivant
          l'heure effective de début de l'activité.
        </span>
      )
    }
  };

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

  React.useEffect(() => {
    const criteriasOK = [];
    const criteriasKO = [];
    if (companyWithInfo?.certificateCriterias) {
      Object.entries(CERTIFICATION_CRITERIAS).forEach(([key, value]) => {
        if (companyWithInfo?.certificateCriterias[key]) {
          criteriasOK.push(value);
        } else {
          criteriasKO.push(value);
        }
      });
    }
    setSucceededCriterias(criteriasOK);
    setFailureCriterias(criteriasKO);
  }, [companyWithInfo]);

  const nbMonthOfCertification = useMemo(() => {
    if (companyWithInfo?.startLastCertificationPeriod) {
      return (
        getMonthsBetweenTwoDates(
          new Date(companyWithInfo?.startLastCertificationPeriod),
          new Date()
        ) + 1
      );
    }
  }, [companyWithInfo]);

  const criteriaCalculationDate = useMemo(() => {
    if (companyWithInfo?.certificateCriterias?.creationTime) {
      return prettyFormatDay(
        jsToUnixTimestamp(
          new Date(
            companyWithInfo?.certificateCriterias?.creationTime
          ).getTime()
        ),
        true
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

  const classes = usePanelStyles();
  const noCertifiedText = useMemo(
    () =>
      companyWithInfo.lastDayCertified
        ? `Votre entreprise ${companyWithInfo.name} n'est plus certifiée.`
        : `Votre entreprise ${companyWithInfo.name} n'est pas encore certifiée.`,
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
        <Typography variant="h6">
          Félicitations, votre entreprise est certifiée depuis{" "}
          {nbMonthOfCertification} mois.
        </Typography>
        <Typography mt={1}>
          Le certificat, fourni par l'équipe Mobilic atteste du fait qu'une
          entreprise se plie à la réglementation de suivi du temps de travail
          et, pour cela, utilise Mobilic de manière conforme. L'attestation est
          valable pour une durée de 6 mois.
        </Typography>
        <CheckboxField
          mt={2}
          checked={acceptCertificationCommunication}
          onChange={() =>
            changeCommunicationSetting(!acceptCertificationCommunication)
          }
          label={`J'accepte que Mobilic communique sur le fait que l'entreprise ${companyWithInfo.name} soit certifiée, notamment auprès des plateformes de mise en relation entre entreprises et particuliers.`}
        />
        <Alert severity="success" mb={2}>
          Attention, le certificat Mobilic n'est en aucun cas un gage de respect
          total de la réglementation par l'entreprise. Il n'atteste que de la
          bonne utilisation de l'outil de suivi du temps de travail{" "}
        </Alert>
      </Box>
    ),
    <Typography key={6} mt={2}>
      <Link
        href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Qu'est-ce que le certificat Mobilic ?
      </Link>
    </Typography>,
    <Box key={10} mt={4}>
      <Typography variant="h4">Synthèse de l'obtention des critères</Typography>
      <Typography mb={1} className={classes.italicInfo}>
        données calculées le {criteriaCalculationDate}
      </Typography>
    </Box>,
    !loadingInfo &&
      companyWithInfo.isCertified &&
      failureCriterias.length === 0 && (
        <Typography key={20} mt={2}>
          Votre entreprise rempli tous les critères mentionnés ci-dessous,
          nécessaires à l'obtention du certificat.
          <br />
          Le calcul des critères est mis à jour automatiquement chaque début de
          mois.
        </Typography>
      ),
    !loadingInfo && companyWithInfo.isCertified && failureCriterias.length > 0 && (
      <Typography key={30} mt={2}>
        <b>
          Attention, votre entreprise ne rempli plus tous les critères
          mentionnés ci-dessous, nécessaires pour garder le certificat à l'issue
          de sa période de validité.
        </b>
        Le calcul des critères est mis à jour automatiquement chaque début de
        mois.
      </Typography>
    ),
    !loadingInfo && !companyWithInfo.isCertified && (
      <Typography key={40} mt={2}>
        Afin d'obtenir une attestation, votre entreprise doit remplir tous les
        critères mentionnés ci-dessous.
        <br />
        Le calcul des critères est mis à jour automatiquement chaque début de
        mois.
      </Typography>
    ),
    !loadingInfo &&
      (failureCriterias.length > 0 || succeededCriterias.length > 0) && (
        <Grid container key={50}>
          <Grid item xs={12} md={6}>
            <Typography mt={4} className={classes.caption}>
              Critères liés à votre utilisation de Mobilic
            </Typography>
            {failureCriterias.length > 0 && (
              <Stack direction="column">
                <Typography mt={2} className={classes.failureCriteriasTitle}>
                  Critères non validés
                </Typography>
                {failureCriterias.map(criteria => (
                  <Alert
                    key={criteria.title}
                    severity="error"
                    className={classes.alertCriteria}
                  >
                    <Accordion
                      elevation={0}
                      className={classes.accordionCriteria}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className={classes.accordionSummary}
                      >
                        {criteria.title}
                      </AccordionSummary>
                      <AccordionDetails className={classes.accordionDetails}>
                        {criteria.explanation}
                      </AccordionDetails>
                    </Accordion>
                  </Alert>
                ))}
              </Stack>
            )}
            {succeededCriterias.length > 0 && (
              <Stack direction="column">
                <Typography mt={2} className={classes.successCriteriasTitle}>
                  Critères validés
                </Typography>
                {succeededCriterias.map(criteria => (
                  <Alert
                    key={criteria.title}
                    severity="success"
                    className={classes.alertCriteria}
                  >
                    <Accordion
                      elevation={0}
                      className={classes.accordionCriteria}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className={classes.accordionSummary}
                      >
                        {criteria.title}
                      </AccordionSummary>
                      <AccordionDetails className={classes.accordionDetails}>
                        {criteria.explanation}
                      </AccordionDetails>
                    </Accordion>
                  </Alert>
                ))}
              </Stack>
            )}
          </Grid>
          <Grid item xs={12} md={6}></Grid>
        </Grid>
      )
  ];
}
