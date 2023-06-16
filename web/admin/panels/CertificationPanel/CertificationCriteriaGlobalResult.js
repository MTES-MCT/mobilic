import React, { useMemo } from "react";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { jsToUnixTimestamp, prettyFormatDay } from "common/utils/time";
import { CERTIFICATION_CRITERIAS } from "./certifiationCriterias";
import CertificationCriteriaSingleResult from "./CertificationCriteriaSingleResult";

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
        Votre entreprise rempli tous les critères mentionnés ci-dessous,
        nécessaires à l'obtention du certificat.
        <br />
        Le calcul des critères est mis à jour automatiquement chaque début de
        mois.
      </Typography>
    ),
    companyWithInfo.isCertified && failureCriterias.length > 0 && (
      <Typography key={30} mt={2}>
        <b>
          Attention, votre entreprise ne rempli plus tous les critères
          mentionnés ci-dessous, nécessaires pour garder le certificat à l'issue
          de sa période de validité.
        </b>
        <br />
        Le calcul des critères est mis à jour automatiquement chaque début de
        mois.
      </Typography>
    ),
    !companyWithInfo.isCertified && (
      <Typography key={40} mt={2}>
        Afin d'obtenir une attestation, votre entreprise doit remplir tous les
        critères mentionnés ci-dessous.
        <br />
        Le calcul des critères est mis à jour automatiquement chaque début de
        mois.
      </Typography>
    ),
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
    )
  ];
}
