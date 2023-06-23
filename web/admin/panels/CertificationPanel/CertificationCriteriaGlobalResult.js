import React, { useMemo } from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { jsToUnixTimestamp, prettyFormatDay } from "common/utils/time";
import { CERTIFICATION_CRITERIAS } from "./certifiationCriterias";
import CertificationCriteriaSingleResult from "./CertificationCriteriaSingleResult";
import { Link } from "../../../common/LinkButton";

const useStyles = makeStyles(theme => ({
  italicInfo: {
    fontStyle: "italic",
    color: theme.palette.grey[600]
  },
  caption: {
    textTransform: "uppercase",
    color: theme.palette.grey[500]
  },
  successCriteriasTitle: {
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  failureCriteriasTitle: {
    color: theme.palette.error.main,
    fontWeight: "bold",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  }
}));

export default function CertificationCriteriaGlobalResult({ companyWithInfo }) {
  const [succeededCriterias, setSucceededCriterias] = React.useState([]);
  const [failureCriterias, setFailureCriterias] = React.useState([]);
  const classes = useStyles();
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

  return [
    <Box key={10} mt={4}>
      <Typography variant="h4">Synthèse de l'obtention des critères</Typography>
      <Typography mb={1} className={classes.italicInfo}>
        données calculées le {criteriaCalculationDate}
      </Typography>
    </Box>,
    companyWithInfo.isCertified && failureCriterias.length === 0 && (
      <Typography key={20} mt={2}>
        Votre entreprise remplit tous les critères nécessaires à l'obtention du
        certificat mentionnés ci-dessous.
      </Typography>
    ),
    companyWithInfo.isCertified && failureCriterias.length > 0 && (
      <Typography key={30} mt={2}>
        <b>
          Attention, votre entreprise ne remplit plus tous les critères
          mentionnés ci-dessous, nécessaires pour garder le certificat à l'issue
          de sa période de validité.
        </b>
      </Typography>
    ),
    !companyWithInfo.isCertified && !companyWithInfo.lastDayCertified && (
      <Typography key={40} mt={2}>
        Pour obtenir le certificat, votre entreprise doit remplir tous les
        critères mentionnés ci-dessous.
      </Typography>
    ),
    !companyWithInfo.isCertified && companyWithInfo.lastDayCertified && (
      <Typography key={42} mt={2}>
        Pour obtenir à nouveau le certificat, votre entreprise doit remplir tous
        les critères mentionnés ci-dessous.
      </Typography>
    ),
    <Typography key={45}>
      Le calcul des critères est mis à jour automatiquement à chaque début de
      mois.
    </Typography>,
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
                <CertificationCriteriaSingleResult
                  key={criteria.title}
                  criteria={criteria}
                  status={"error"}
                />
              ))}
            </Stack>
          )}
          {succeededCriterias.length > 0 && (
            <Stack direction="column">
              <Typography mt={2} className={classes.successCriteriasTitle}>
                Critères validés
              </Typography>
              {succeededCriterias.map(criteria => (
                <CertificationCriteriaSingleResult
                  key={criteria.title}
                  criteria={criteria}
                  status={"success"}
                />
              ))}
            </Stack>
          )}
        </Grid>
        <Grid item xs={12} md={6}></Grid>
      </Grid>
    ),
    <Typography key={6} mt={2}>
      <Link
        href="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/comment-obtenir-le-certificat-mobilic#les-criteres-dobtention-du-certificat"
        target="_blank"
        rel="noopener noreferrer"
      >
        Consulter le détail des critères
      </Link>
    </Typography>
  ];
}
