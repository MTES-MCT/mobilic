import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import RegulatoryThresholdItem from "./RegulatoryThresholdItem";
import {
  CATEGORY_LABELS,
  GRID_CLASSES,
  getThresholdsByCategory
} from "./regulatoryThresholdConstants";

export default function RegulatoryThresholdsGrid({
  regulatoryData = {},
  showOnlyDaily = false,
  showOnlyWeekly = false,
  className = ""
}) {
  const dailyThresholds = processThresholdsByCategory("daily", regulatoryData);
  const weeklyThresholds = processThresholdsByCategory(
    "weekly",
    regulatoryData
  );

  if (showOnlyDaily || showOnlyWeekly) {
    const thresholds = showOnlyDaily ? dailyThresholds : weeklyThresholds;

    return (
      <div className={className}>
        <div className={cx(fr.cx("fr-mb-4w"))}>
          {thresholds.length > 0 ? (
            thresholds.map((threshold, index) => (
              <RegulatoryThresholdItem
                key={`${showOnlyDaily ? "daily" : "weekly"}-${
                  threshold.thresholdType
                }-${index}`}
                thresholdType={threshold.thresholdType}
                isCompliant={threshold.isCompliant}
                thresholdData={threshold.data}
              />
            ))
          ) : (
            <div className={cx(fr.cx("fr-callout", "fr-callout--info"))}>
              <h4 className={cx(fr.cx("fr-callout__title"))}>
                Aucune donnée disponible
              </h4>
              <p className={cx(fr.cx("fr-callout__text", "fr-mb-0"))}>
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
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            {dailyThresholds.length > 0 ? (
              dailyThresholds.map((threshold, index) => (
                <RegulatoryThresholdItem
                  key={`daily-${threshold.thresholdType}-${index}`}
                  thresholdType={threshold.thresholdType}
                  isCompliant={threshold.isCompliant}
                  thresholdData={threshold.data}
                />
              ))
            ) : (
              <div className={cx(fr.cx("fr-callout", "fr-callout--info"))}>
                <h4 className={cx(fr.cx("fr-callout__title"))}>
                  Aucune donnée disponible
                </h4>
                <p className={cx(fr.cx("fr-callout__text", "fr-mb-0"))}>
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
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            {weeklyThresholds.length > 0 ? (
              weeklyThresholds.map((threshold, index) => (
                <RegulatoryThresholdItem
                  key={`weekly-${threshold.thresholdType}-${index}`}
                  thresholdType={threshold.thresholdType}
                  isCompliant={threshold.isCompliant}
                  thresholdData={threshold.data}
                />
              ))
            ) : (
              <div className={cx(fr.cx("fr-callout", "fr-callout--info"))}>
                <h4 className={cx(fr.cx("fr-callout__title"))}>
                  Aucune donnée disponible
                </h4>
                <p className={cx(fr.cx("fr-callout__text", "fr-mb-0"))}>
                  Les données sur les seuils hebdomadaires ne sont pas encore
                  disponibles pour la période sélectionnée.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function processThresholdsByCategory(category, regulatoryData) {
  const categoryThresholds = getThresholdsByCategory(category);

  return categoryThresholds
    .map(thresholdConfig => {
      if (!thresholdConfig) {
        return null;
      }

      const backendType = thresholdConfig.backendType;
      const thresholdDetail = findRegulatoryDataByType(
        regulatoryData,
        backendType
      );

      return {
        thresholdType: backendType,
        isCompliant: thresholdDetail ? thresholdDetail.success : false,
        data: thresholdDetail,
        config: thresholdConfig
      };
    })
    .filter(Boolean);
}

function findRegulatoryDataByType(regulatoryData, backendType) {
  // New data structure from useRegulatoryScore hook uses 'details' array
  if (!regulatoryData || !regulatoryData.details) {
    return null;
  }

  // Find matching threshold data by type
  const matchingDetail = regulatoryData.details.find(
    detail => detail.type === backendType
  );

  if (matchingDetail) {
    return {
      success: matchingDetail.compliant,
      type: matchingDetail.type,
      totalAlerts: matchingDetail.totalAlerts,
      significantAlerts: matchingDetail.significantAlerts,
      alertDetails: matchingDetail.alertDetails
    };
  }

  return null;
}
