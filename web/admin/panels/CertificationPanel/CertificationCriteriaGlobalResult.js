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
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

const useStyles = makeStyles(theme => ({
  italicInfo: {
    fontStyle: "italic",
    color: theme.palette.grey[600]
  },
  caption: {
    textTransform: "uppercase",
    color: fr.colors.decisions.text.mention.grey.default
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
  const [infoCriterias, setInfoCriterias] = React.useState([]);
  const classes = useStyles();
  const criteriaCalculationDate = useMemo(() => {
    if (
      companyWithInfo.currentCompanyCertification?.certificateCriterias
        ?.creationTime
    ) {
      return prettyFormatDay(
        jsToUnixTimestamp(
          new Date(
            companyWithInfo.currentCompanyCertification.certificateCriterias?.creationTime
          ).getTime()
        ),
        true
      );
    }
  }, [companyWithInfo]);

  React.useEffect(() => {
    const criteriasOK = [];
    const criteriasKO = [];
    const criteriasINFO = [];
    Object.entries(CERTIFICATION_CRITERIAS).forEach(([key, value]) => {
      if (!companyWithInfo.currentCompanyCertification?.certificateCriterias) {
        criteriasINFO.push(value);
      } else if (
        companyWithInfo.currentCompanyCertification.certificateCriterias[key]
      ) {
        criteriasOK.push(value);
      } else {
        criteriasKO.push(value);
      }
    });
    setSucceededCriterias(criteriasOK);
    setFailureCriterias(criteriasKO);
    setInfoCriterias(criteriasINFO);
  }, [companyWithInfo]);

  return [
    <Box key={10} mt={4}>
      <h3 className={cx(fr.cx("fr-h3", "fr-mb-4w"))}>
        Synthèse de l'obtention des critères
      </h3>
      {companyWithInfo.currentCompanyCertification?.certificateCriterias && (
        <Typography mb={1} className={classes.italicInfo}>
          données calculées le {criteriaCalculationDate}
        </Typography>
      )}
    </Box>,
    companyWithInfo.currentCompanyCertification?.isCertified &&
      failureCriterias.length === 0 && (
        <Typography key={20} mt={2}>
          Votre entreprise remplit tous les critères nécessaires à l'obtention
          du certificat mentionnés ci-dessous.
        </Typography>
      ),
    companyWithInfo.currentCompanyCertification?.isCertified &&
      failureCriterias.length > 0 && (
        <Typography key={30} mt={2}>
          <b>
            Attention, votre entreprise ne remplit plus l’ensemble des critères
            nécessaires au renouvellement de votre certificat. Ces critères sont
            mentionnés ci-dessous.
          </b>
        </Typography>
      ),
    !companyWithInfo.currentCompanyCertification?.isCertified &&
      !companyWithInfo.currentCompanyCertification?.lastDayCertified && (
        <Typography key={40} mt={2}>
          Pour obtenir le certificat, votre entreprise doit remplir tous les
          critères mentionnés ci-dessous.
        </Typography>
      ),
    !companyWithInfo.currentCompanyCertification?.isCertified &&
      companyWithInfo.currentCompanyCertification?.lastDayCertified && (
        <Typography key={42} mt={2}>
          Pour obtenir à nouveau le certificat, votre entreprise doit remplir
          tous les critères mentionnés ci-dessous.
        </Typography>
      ),
    <Typography key={45} mb={3}>
      Le calcul des critères est mis à jour automatiquement à chaque début de
      mois.
    </Typography>,
    <Grid container key={50}>
      <Grid item xs={12} md={6}>
        {(failureCriterias.length > 0 || succeededCriterias.length > 0) && (
          <Typography className={classes.caption}>
            Critères liés à votre utilisation de Mobilic
          </Typography>
        )}
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
        {infoCriterias.length > 0 && (
          <Stack direction="column">
            {infoCriterias.map(criteria => (
              <CertificationCriteriaSingleResult
                key={criteria.title}
                criteria={criteria}
                status={"info"}
                icon={false}
                color={"primary"}
              />
            ))}
          </Stack>
        )}
      </Grid>
      <Grid item xs={12} md={6}></Grid>
    </Grid>,
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
