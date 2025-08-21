import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import RegulatoryThresholdItem from "./RegulatoryThresholdItem";
import { GRID_CLASSES } from "./regulatoryThresholdConstants";

export default function RegulatoryThresholdsGrid({
  compliancyReport,
  className = ""
}) {
  return (
    <div className={className}>
      <div className={GRID_CLASSES.container}>
        <div className={GRID_CLASSES.column}>
          <div className={cx(fr.cx("fr-mb-3w"))}>
            <h4 className={cx(fr.cx("fr-h5", "fr-mb-2w"))}>
              Seuils journaliers
            </h4>
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            {compliancyReport
              .filter(compliancyItem => compliancyItem.period === "day")
              .map((compliancyItem, index) => (
                <RegulatoryThresholdItem
                  key={`daily-${compliancyItem.type}-${index}`}
                  compliancyItem={compliancyItem}
                />
              ))}
          </div>
        </div>

        <div className={GRID_CLASSES.column}>
          <div className={cx(fr.cx("fr-mb-3w"))}>
            <h4 className={cx(fr.cx("fr-h5", "fr-mb-2w"))}>
              Seuils hebdomadaires
            </h4>
          </div>

          <div className={cx(fr.cx("fr-mb-4w"))}>
            {compliancyReport
              .filter(compliancyItem => compliancyItem.period === "week")
              .map((compliancyItem, index) => (
                <RegulatoryThresholdItem
                  key={`daily-${compliancyItem.type}-${index}`}
                  compliancyItem={compliancyItem}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
