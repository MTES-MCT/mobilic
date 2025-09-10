import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { CertificationImage, getFrenchMedalLabel } from "../certification";
import { API_HOST } from "common/utils/api";

const REGULATION_CHECKS = [
  {
    type: "minimumDailyRest",
    period: "day",
    labelOk: "Repos journalier respecté",
    labelKo: "Repos journalier non respecté"
  },
  {
    type: "maximumWorkDayTime",
    period: "day",
    labelOk: "Durée du travail quotidien respectée",
    labelKo: "Durée du travail quotidien non respectée"
  },
  {
    type: "enoughBreak",
    extraField: "not_enough_break",
    period: "day",
    labelOk: "Temps de pause respecté",
    labelKo: "Temps de pause non respecté"
  },
  {
    type: "enoughBreak",
    extraField: "too_much_uninterrupted_work_time",
    period: "day",
    labelOk: "Durée maximale de travail ininterrompu respectée",
    labelKo: "Durée maximale de travail ininterrompu non respectée"
  },
  {
    type: "maximumWorkInCalendarWeek",
    period: "week",
    labelOk: "Repos hebdomadaire respecté",
    labelKo: "Repos hebdomadaire non respecté"
  },
  {
    type: "maximumWorkedDaysInWeek",
    period: "week",
    labelOk: "Durée du travail hebdomadaire respectée",
    labelKo: "Durée du travail hebdomadaire non respectée"
  }
];
export const TextBadge = ({ medal }) => {
  const frenchMedalLabel = getFrenchMedalLabel(medal);
  return (
    <Badge
      severity="new"
      noIcon
      small
      style={{ color: "#716043", backgroundColor: "#FEF6E3" }}
    >
      Certifiée {frenchMedalLabel}
    </Badge>
  );
};

export const useCompanyCertification = companyCertification => {
  if (!companyCertification) {
    return {};
  }
  const { certificationMedal: medal, isCertified } = companyCertification;

  const frenchMedalLabel = getFrenchMedalLabel(medal);

  const _TextBadge = () => <TextBadge medal={medal} />;

  const _CertificationImage = ({ ...props }) => (
    <CertificationImage medal={medal} {...props} />
  );

  let alerts = [];
  if (companyCertification.certificateCriterias?.info) {
    alerts =
      JSON.parse(companyCertification.certificateCriterias.info)?.alerts || [];
  }
  const compliancyReport = REGULATION_CHECKS.map(check => {
    const isAlertThere = alerts.find(
      a =>
        a.type === check.type &&
        (!check.extraField || check.extraField === a.extra_field)
    );
    return {
      ...check,
      isOk: !isAlertThere
    };
  });

  const companyBadgeUrl = `${window.location.origin}${API_HOST}${companyCertification.badgeUrl}`;

  return {
    medal,
    isCertified,
    frenchMedalLabel,
    TextBadge: _TextBadge,
    CertificationImage: _CertificationImage,
    compliancyReport,
    companyBadgeUrl,
    logInRealTime:
      companyCertification.certificateCriterias?.logInRealTime || 0,
    adminChanges: companyCertification.certificateCriterias?.adminChanges || 1,
    compliancy: companyCertification.certificateCriterias?.compliancy || 0
  };
};
