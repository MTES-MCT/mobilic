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
        const result = {
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
