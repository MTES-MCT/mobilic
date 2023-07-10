import React, { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { Link, Notice } from "@dataesr/react-dsfr";
import { getMonthsBetweenTwoDates } from "common/utils/time";
import {
  useCertificationInfo,
  useSendCertificationInfoResult
} from "../utils/certificationInfo";

const useStyles = makeStyles({
  certificateBanner: {
    width: "100%",
    backgroundColor: "var(--background-contrast-info)"
  }
});

export function CertificateBanner() {
  const [sendSuccess, sendClose, sendLoad] = useSendCertificationInfoResult();
  const classes = useStyles();
  const { companyWithInfo } = useCertificationInfo();
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => sendLoad(), []);

  const content = useMemo(() => {
    if (!companyWithInfo.certificateCriterias?.creationTime) {
      return {
        title: "Devenez une entreprise certifiée Mobilic",
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

  const onCloseBanner = async () => {
    await sendClose();
    setVisible(false);
  };

  const onClickLinkBanner = async () => {
    await sendSuccess();
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
            onClick={() => onClickLinkBanner()}
          >
            {content.linkText}
          </Link>
        }
      />
    </div>
  );
}
