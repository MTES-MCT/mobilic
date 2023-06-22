import React, { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { Link, Notice } from "@dataesr/react-dsfr";
import { useApi } from "common/utils/api";
import { useAdminCompanies } from "../store/store";
import { getMonthsBetweenTwoDates } from "common/utils/time";
import { COMPANY_CERTIFICATION_COMMUNICATION_QUERY } from "common/utils/apiQueries";

const useStyles = makeStyles({
  certificateBanner: {
    width: "100%",
    backgroundColor: "var(--background-contrast-info)"
  }
});

export function CertificateBanner() {
  const classes = useStyles();
  const api = useApi();
  const [, company] = useAdminCompanies();
  const [companyWithInfo, setCompanyWithInfo] = React.useState({});
  const [visible, setVisible] = React.useState(false);

  // TODO 1123: refactor to mutualize this code
  React.useEffect(async () => {
    setVisible(false);
    if (company) {
      const apiResponse = await api.graphQlQuery(
        COMPANY_CERTIFICATION_COMMUNICATION_QUERY,
        {
          companyId: company.id
        }
      );
      setCompanyWithInfo(apiResponse?.data?.company);
      setVisible(true);
    }
  }, [company]);

  const content = useMemo(() => {
    if (!companyWithInfo.certificateCriterias?.creationTime) {
      return {
        title: "Devenez une entreprise certifiée Mobilic !",
        linkText: "Découvrir les critères"
      };
    }
    if (!companyWithInfo.isCertified) {
      const nbMonthLastCertification = getMonthsBetweenTwoDates(
        new Date(companyWithInfo.lastDayCertified),
        new Date()
      );

      if (nbMonthLastCertification === 1) {
        return {
          title:
            "Attention, votre certificat Mobilic ne peut pas être renouvelé",
          linkText: "Se mettre à niveau"
        };
      }

      return {
        title: "Vous ne remplissez pas les critères de certification Mobilic",
        linkText: "Se mettre à niveau"
      };
    }

    const nbMonthOfCertification =
      getMonthsBetweenTwoDates(
        new Date(companyWithInfo.startLastCertificationPeriod),
        new Date()
      ) + 1;

    if (nbMonthOfCertification === 1) {
      return {
        title: "Félicitations, vous venez d'obtenir le certificat Mobilic",
        linkText: "Voir les critères"
      };
    }

    if (nbMonthOfCertification % 7 === 0) {
      return {
        title: "Félicitations, votre certificat est renouvelé",
        linkText: "Voir les critères"
      };
    }

    const currentCriterias = companyWithInfo.certificateCriterias;
    if (
      !currentCriterias.beActive ||
      !currentCriterias.beCompliant ||
      !currentCriterias.logInRealTime ||
      !currentCriterias.notTooManyChanges ||
      !currentCriterias.validateRegularly
    ) {
      return {
        title:
          "Attention, vous ne respectez plus tous les critères du certificat Mobilic",
        linkText: "Se mettre à niveau"
      };
    }

    return {
      title: `Félicitations, vous êtes certifiés depuis ${nbMonthOfCertification} mois`,
      linkText: "Voir les critères"
    };
  }, [companyWithInfo]);

  const onCloseBanner = () => {
    setVisible(false);
  };

  return (
    <div className={classes.certificateBanner}>
      <Notice
        title={content.title}
        visible={visible}
        onClose={onCloseBanner}
        asLink={
          <Link
            className="certificateBannerLink"
            as={<RouterLink to="/admin/company?tab=certificat" />}
          >
            {content.linkText}
          </Link>
        }
      />
    </div>
  );
}
