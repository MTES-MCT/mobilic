import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import RegulatoryThresholdItem from "./RegulatoryThresholdItem";
import { ComplianceStatusSummary } from "./ComplianceIndicator";
import {
  THRESHOLDS_BY_CATEGORY,
  CATEGORY_LABELS,
  GRID_CLASSES,
  getThresholdsByCategory
} from "./regulatoryThresholdConstants";

/**
 * RegulatoryThresholdsGrid - Pure DSFR v1.26 Component
 * Two-column layout exactly matching certificat_*_regulation.png designs
 * Left column: "Seuils journaliers" | Right column: "Seuils hebdomadaires"
 */
export default function RegulatoryThresholdsGrid({
  regulatoryData = {},
  detailed = true,
  showSummary = true,
  className = ""
}) {
  // Process regulatory data by category
  const dailyThresholds = processThresholdsByCategory("daily", regulatoryData);
  const weeklyThresholds = processThresholdsByCategory(
    "weekly",
    regulatoryData
  );

  // Calculate compliance summaries
  const dailyCompliantCount = dailyThresholds.filter(t => t.isCompliant).length;
  const weeklyCompliantCount = weeklyThresholds.filter(t => t.isCompliant)
    .length;

  return (
    <div className={cx(fr.cx("fr-container"), className)}>
      {/* Grid container with DSFR grid system */}
      <div className={GRID_CLASSES.container}>
        {/* Daily Thresholds Column */}
        <div className={GRID_CLASSES.column}>
          {/* Column Header */}
          <div className={cx(fr.cx("fr-mb-3w"))}>
            <h4 className={cx(fr.cx("fr-h5", "fr-mb-2w"))}>
              {CATEGORY_LABELS.daily}
            </h4>

            {/* Summary for daily thresholds */}
            {showSummary && (
              <ComplianceStatusSummary
                compliantCount={dailyCompliantCount}
                totalCount={dailyThresholds.length}
                categoryLabel={CATEGORY_LABELS.daily}
              />
            )}
          </div>

          {/* Daily threshold items */}
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

        {/* Weekly Thresholds Column */}
        <div className={GRID_CLASSES.column}>
          {/* Column Header */}
          <div className={cx(fr.cx("fr-mb-3w"))}>
            <h4 className={cx(fr.cx("fr-h5", "fr-mb-2w"))}>
              {CATEGORY_LABELS.weekly}
            </h4>

            {/* Summary for weekly thresholds */}
            {showSummary && (
              <ComplianceStatusSummary
                compliantCount={weeklyCompliantCount}
                totalCount={weeklyThresholds.length}
                categoryLabel={CATEGORY_LABELS.weekly}
              />
            )}
          </div>

          {/* Weekly threshold items */}
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

      {/* Overall compliance status */}
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

/**
 * Process regulatory data for a specific category (daily/weekly)
 * Maps backend data to frontend display format
 */
function processThresholdsByCategory(category, regulatoryData) {
  const thresholdTypes = THRESHOLDS_BY_CATEGORY[category];

  return thresholdTypes
    .map(thresholdType => {
      const thresholdConfig = getThresholdsByCategory(category).find(
        config =>
          config.backendType === thresholdType.toLowerCase().replace(/_/g, "")
      );

      if (!thresholdConfig) {
        console.warn(
          `No configuration found for threshold type: ${thresholdType}`
        );
        return null;
      }

      // Find matching regulatory data
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
    .filter(Boolean); // Remove null entries
}

/**
 * Find regulatory data by backend type
 * Searches through the regulatory computations to find matching threshold
 */
function findRegulatoryDataByType(regulatoryData, backendType) {
  if (!regulatoryData || !regulatoryData.regulationComputations) {
    return null;
  }

  // Search through regulation computations
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

/**
 * Overall Compliance Status Component
 * Shows aggregate compliance across both daily and weekly thresholds
 */
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

// Default props
RegulatoryThresholdsGrid.defaultProps = {
  regulatoryData: {},
  detailed: true,
  showSummary: true,
  className: ""
};
