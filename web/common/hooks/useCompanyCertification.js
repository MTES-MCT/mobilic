import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { CertificationImage, getFrenchMedalLabel } from "../certification";
import { API_HOST } from "common/utils/api";
import classNames from "classnames";

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
export const TextBadge = ({
  medal,
  displayIsCertified = false,
  isWhiteBackground = false
}) => {
  const frenchMedalLabel = getFrenchMedalLabel(medal);
  return (
    <Badge
      severity="new"
      noIcon
      small
      className={classNames(medal.toLowerCase(), {
        "white-background": isWhiteBackground
      })}
    >
      {displayIsCertified ? "Certifiée " : ""}
      {frenchMedalLabel}
    </Badge>
  );
};

export const useCompanyCertification = companyCertification => {
  if (!companyCertification) {
    return { hasData: false };
  }

  const hasCertificationData = Boolean(
    companyCertification.certificateCriterias
  );

  const { certificationMedal: medal, isCertified } = companyCertification;

  const frenchMedalLabel = getFrenchMedalLabel(medal);

  const _TextBadge = () => (
    <TextBadge medal={medal} displayIsCertified={true} />
  );

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
    hasData: hasCertificationData,
    medal,
    isCertified,
    frenchMedalLabel,
    TextBadge: _TextBadge,
    CertificationImage: _CertificationImage,
    compliancyReport,
    companyBadgeUrl,
    logInRealTime:
      companyCertification.certificateCriterias?.logInRealTime || null,
    adminChanges:
      companyCertification.certificateCriterias?.adminChanges || null,
    compliancy: companyCertification.certificateCriterias?.compliancy || null
  };
};
