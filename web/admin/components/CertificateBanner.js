import React, { useState } from "react";
import moment from "moment";
import { Link, Notice } from "@dataesr/react-dsfr";
import { useApi } from "common/utils/api";
import { useAdminCompanies } from "../store/store";
import { COMPANY_CERTIFICATION_COMMUNICATION_QUERY } from "common/utils/apiQueries";

export function CertificateBanner() {
  const api = useApi();
  const [, company] = useAdminCompanies();
  const [content, setContent] = React.useState({});
  const [visible, setVisible] = useState(false);

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
      const companyWithInfo = apiResponse?.data?.company;
      setContent(getContent(companyWithInfo));
      setVisible(true);
    }
  }, [company]);

  // TODO 1123 extract in date/time utils?
  const nMonthAgo = day => {
    const currentDate = moment();
    const inputDate = moment(day);
    return currentDate.diff(inputDate, "months");
  };

  const getContent = companyWithInfo => {
    if (!companyWithInfo.isCertified) {
      if (nMonthAgo(companyWithInfo.lastDayCertified) === 1) {
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

    const numMonthCertified =
      nMonthAgo(companyWithInfo.startLastCertificationPeriod) + 1;
    console.log(numMonthCertified);
    if (numMonthCertified === 1) {
      return {
        title: "Félicitations, vous venez d'obtenir le certificat Mobilic",
        linkText: "Voir les critères"
      };
    }
    if (numMonthCertified % 7 === 0) {
      return {
        title: "Félicitations, votre certificat est renouvelé",
        linkText: "Voir les critères"
      };
    }
    const currentCriterias = companyWithInfo.certificateCriterias;
    if (
      numMonthCertified % 6 === 0 &&
      (!currentCriterias.beActive ||
        !currentCriterias.beCompliant ||
        !currentCriterias.logInRealTime ||
        !currentCriterias.notTooManyChanges ||
        !currentCriterias.validateRegularly)
    ) {
      return {
        title:
          "Attention, vous ne respectez plus tous les critères du certificat Mobilic",
        linkText: "Se mettre à niveau"
      };
    }

    return {
      title: `Félicitations, vous êtes certifiés depuis ${numMonthCertified -
        1} mois`,
      linkText: "Voir les critères"
    };
  };

  const onCloseBanner = () => {
    setVisible(false);
  };

  // TODO 1123: handle link destination
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--background-contrast-info)"
      }}
    >
      <Notice
        title={content.title}
        visible={visible}
        onClose={onCloseBanner}
        asLink={
          <Link className="certificateBannerLink" href="#">
            {content.linkText}
          </Link>
        }
      />
    </div>
  );
}
