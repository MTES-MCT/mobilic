import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import RegulatoryThresholdItem from "./RegulatoryThresholdItem";
import { ComplianceStatusSummary } from "./ComplianceIndicator";
import {
  CATEGORY_LABELS,
  GRID_CLASSES,
  getThresholdsByCategory
} from "./regulatoryThresholdConstants";

export default function RegulatoryThresholdsGrid({
  regulatoryData = {},
  detailed = true,
  showSummary = true,
  showOnlyDaily = false,
  showOnlyWeekly = false,
  className = ""
}) {
  const dailyThresholds = processThresholdsByCategory("daily", regulatoryData);
  const weeklyThresholds = processThresholdsByCategory(
    "weekly",
    regulatoryData
  );

  const dailyCompliantCount = dailyThresholds.filter(t => t.isCompliant).length;
  const weeklyCompliantCount = weeklyThresholds.filter(t => t.isCompliant)
    .length;

  if (showOnlyDaily || showOnlyWeekly) {
    const thresholds = showOnlyDaily ? dailyThresholds : weeklyThresholds;
    const categoryLabel = showOnlyDaily
      ? CATEGORY_LABELS.daily
      : CATEGORY_LABELS.weekly;
    const compliantCount = showOnlyDaily
      ? dailyCompliantCount
      : weeklyCompliantCount;

    return (
      <div className={className}>
        <div className={cx(fr.cx("fr-mb-4w"))}>
          {showSummary && (
            <ComplianceStatusSummary
              compliantCount={compliantCount}
              totalCount={thresholds.length}
              categoryLabel={categoryLabel}
            />
          )}

          {thresholds.length > 0 ? (
            thresholds.map((threshold, index) => (
              <RegulatoryThresholdItem
                key={`${showOnlyDaily ? "daily" : "weekly"}-${
                  threshold.thresholdType
                }-${index}`}
                thresholdType={threshold.thresholdType}
                isCompliant={threshold.isCompliant}
                thresholdData={threshold.data}
                detailed={detailed}
              />
            ))
          ) : (
            <div className={cx(fr.cx("fr-alert", "fr-alert--info"))}>
              <p className={cx(fr.cx("fr-alert__title"))}>
                Aucune donnée disponible
              </p>
              <p className={cx(fr.cx("fr-mb-0"))}>
                Les données sur les seuils{" "}
                {showOnlyDaily ? "journaliers" : "hebdomadaires"} ne sont pas
                encore disponibles pour la période sélectionnée.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={GRID_CLASSES.container}>
        <div className={GRID_CLASSES.column}>
          <div className={cx(fr.cx("fr-mb-3w"))}>
            <h4 className={cx(fr.cx("fr-h5", "fr-mb-2w"))}>
              {CATEGORY_LABELS.daily}
            </h4>

            {showSummary && (
              <ComplianceStatusSummary
                compliantCount={dailyCompliantCount}
                totalCount={dailyThresholds.length}
                categoryLabel={CATEGORY_LABELS.daily}
              />
            )}
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            {dailyThresholds.length > 0 ? (
              dailyThresholds.map((threshold, index) => (
                <RegulatoryThresholdItem
                  key={`daily-${threshold.thresholdType}-${index}`}
                  thresholdType={threshold.thresholdType}
                  isCompliant={threshold.isCompliant}
                  thresholdData={threshold.data}
                  detailed={detailed}
                />
              ))
            ) : (
              <div className={cx(fr.cx("fr-alert", "fr-alert--info"))}>
                <p className={cx(fr.cx("fr-alert__title"))}>
                  Aucune donnée disponible
                </p>
                <p className={cx(fr.cx("fr-mb-0"))}>
                  Les données sur les seuils journaliers ne sont pas encore
                  disponibles pour la période sélectionnée.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={GRID_CLASSES.column}>
          <div className={cx(fr.cx("fr-mb-3w"))}>
            <h4 className={cx(fr.cx("fr-h5", "fr-mb-2w"))}>
              {CATEGORY_LABELS.weekly}
            </h4>

            {showSummary && (
              <ComplianceStatusSummary
                compliantCount={weeklyCompliantCount}
                totalCount={weeklyThresholds.length}
                categoryLabel={CATEGORY_LABELS.weekly}
              />
            )}
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            {weeklyThresholds.length > 0 ? (
              weeklyThresholds.map((threshold, index) => (
                <RegulatoryThresholdItem
                  key={`weekly-${threshold.thresholdType}-${index}`}
                  thresholdType={threshold.thresholdType}
                  isCompliant={threshold.isCompliant}
                  thresholdData={threshold.data}
                  detailed={detailed}
                />
              ))
            ) : (
              <div className={cx(fr.cx("fr-alert", "fr-alert--info"))}>
                <p className={cx(fr.cx("fr-alert__title"))}>
                  Aucune donnée disponible
                </p>
                <p className={cx(fr.cx("fr-mb-0"))}>
                  Les données sur les seuils hebdomadaires ne sont pas encore
                  disponibles pour la période sélectionnée.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSummary &&
        (dailyThresholds.length > 0 || weeklyThresholds.length > 0) && (
          <div className={cx(fr.cx("fr-mt-4w"))}>
            <OverallComplianceStatus
              dailyCompliantCount={dailyCompliantCount}
              dailyTotalCount={dailyThresholds.length}
              weeklyCompliantCount={weeklyCompliantCount}
              weeklyTotalCount={weeklyThresholds.length}
            />
          </div>
        )}
    </div>
  );
}

function processThresholdsByCategory(category, regulatoryData) {
  const thresholdConfigs = getThresholdsByCategory(category);

  return thresholdConfigs
    .map(thresholdConfig => {
      if (!thresholdConfig) {
        return null;
      }

      const backendType = thresholdConfig.backendType;
      const matchingData = findRegulatoryDataByType(
        regulatoryData,
        backendType
      );

      return {
        thresholdType: backendType,
        isCompliant: matchingData ? matchingData.success : false,
        data: matchingData,
        config: thresholdConfig
      };
    })
    .filter(Boolean);
}

function findRegulatoryDataByType(regulatoryData, backendType) {
  if (!regulatoryData || !regulatoryData.regulationComputations) {
    return null;
  }

  for (const dayData of regulatoryData.regulationComputations) {
    if (dayData.regulationComputations) {
      const matchingComputation = dayData.regulationComputations.find(
        computation =>
          computation.regulationCheck &&
          computation.regulationCheck.type === backendType
      );

      if (matchingComputation) {
        return {
          success: matchingComputation.success,
          extra: matchingComputation.extra,
          day: dayData.day,
          regulationRule: matchingComputation.regulationRule
        };
      }
    }
  }

  return null;
}

function OverallComplianceStatus({
  dailyCompliantCount,
  dailyTotalCount,
  weeklyCompliantCount,
  weeklyTotalCount
}) {
  const totalCompliant = dailyCompliantCount + weeklyCompliantCount;
  const totalThresholds = dailyTotalCount + weeklyTotalCount;
  const compliancePercentage =
    totalThresholds > 0
      ? Math.round((totalCompliant / totalThresholds) * 100)
      : 0;

  let severity, icon, title;

  if (compliancePercentage === 100) {
    severity = "success";
    icon = "✅";
    title = "Tous les seuils réglementaires sont respectés";
  } else if (compliancePercentage === 0) {
    severity = "error";
    icon = "⚠️";
    title = "Aucun seuil réglementaire n'est respecté";
  } else {
    severity = "warning";
    icon = "⚠️";
    title = `${compliancePercentage}% des seuils réglementaires sont respectés`;
  }

  return (
    <div className={cx(fr.cx("fr-alert", `fr-alert--${severity}`))}>
      <h5 className={cx(fr.cx("fr-alert__title"))}>
        <span className={cx(fr.cx("fr-mr-1w"))}>{icon}</span>
        {title}
      </h5>
      <p className={cx(fr.cx("fr-mb-0"))}>
        {totalCompliant} sur {totalThresholds} seuils respectés (
        {dailyCompliantCount}/{dailyTotalCount} journaliers,{" "}
        {weeklyCompliantCount}/{weeklyTotalCount} hebdomadaires)
      </p>
    </div>
  );
}
