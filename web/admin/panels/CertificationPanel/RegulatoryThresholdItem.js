import React from "react";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import ComplianceIndicator, {
  CompactComplianceRow
} from "./ComplianceIndicator";
import { getThresholdConfig } from "./regulatoryThresholdConstants";

/**
 * RegulatoryThresholdItem - Pure DSFR v1.26 Component
 * Individual accordion item for regulatory thresholds
 * Matches expandable behavior from certificat_*_regulation.png designs
 */
export default function RegulatoryThresholdItem({
  thresholdType,
  isCompliant,
  thresholdData = null,
  detailed = false,
  className = ""
}) {
  const thresholdConfig = getThresholdConfig(thresholdType);

  if (!thresholdConfig) {
    console.warn(`Unknown threshold type: ${thresholdType}`);
    return null;
  }

  // Determine the label based on compliance status
  const displayLabel = isCompliant
    ? thresholdConfig.label
    : thresholdConfig.labelNonCompliant || thresholdConfig.label;

  // Prepare detailed content for accordion expansion
  const accordionContent = (
    <div className={cx(fr.cx("fr-container"))}>
      {/* Main compliance indicator */}
      <ComplianceIndicator
        isCompliant={isCompliant}
        thresholdLabel={displayLabel}
        thresholdExplanation={thresholdConfig.explanation}
        mode="alert"
        showDetails={true}
      />

      {/* Additional threshold data if available */}
      {thresholdData && (
        <div className={cx(fr.cx("fr-mt-2w"))}>
          <h5 className={cx(fr.cx("fr-h6", "fr-mb-1w"))}>Détails du calcul</h5>

          {/* Render threshold-specific data */}
          {renderThresholdDetails(thresholdType, thresholdData, isCompliant)}
        </div>
      )}

      {/* Regulatory explanation */}
      <div
        className={cx(
          fr.cx("fr-mt-3w", "fr-p-2w", "fr-background-contrast--grey")
        )}
      >
        <h6 className={cx(fr.cx("fr-text--sm", "fr-text--bold", "fr-mb-1w"))}>
          Réglementation
        </h6>
        <p className={cx(fr.cx("fr-text--sm", "fr-mb-0"))}>
          {thresholdConfig.explanation}
        </p>
      </div>
    </div>
  );

  // Simple mode: just a compact row (for summary views)
  if (!detailed) {
    return (
      <div className={cx(fr.cx("fr-py-1w"), className)}>
        <CompactComplianceRow
          isCompliant={isCompliant}
          thresholdLabel={displayLabel}
        />
      </div>
    );
  }

  // Full accordion mode with expandable details
  return (
    <div className={cx(fr.cx("fr-mb-2w"), className)}>
      <Accordion
        label={
          <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--middle"))}>
            {/* Compliance icon */}
            <div className={cx(fr.cx("fr-col-auto", "fr-pr-2w"))}>
              <ComplianceIndicator
                isCompliant={isCompliant}
                thresholdLabel={displayLabel}
                mode="icon-only"
              />
            </div>

            {/* Threshold label */}
            <div className={cx(fr.cx("fr-col"))}>
              <span className={cx(fr.cx("fr-text--md"))}>{displayLabel}</span>
            </div>

            {/* Optional threshold icon */}
            <div className={cx(fr.cx("fr-col-auto"))}>
              <i className={thresholdConfig.iconClass} aria-hidden="true" />
            </div>
          </div>
        }
        // DSFR v1.26: Simplified accordion API with automatic ARIA management
      >
        {accordionContent}
      </Accordion>
    </div>
  );
}

/**
 * Renders threshold-specific detail information
 * Based on the threshold type and data structure
 */
function renderThresholdDetails(thresholdType, thresholdData, isCompliant) {
  if (!thresholdData || !thresholdData.extra) {
    return (
      <p className={cx(fr.cx("fr-text--sm", "fr-text-mention--grey"))}>
        Aucune donnée détaillée disponible
      </p>
    );
  }

  const { extra } = thresholdData;

  switch (thresholdType) {
    case "minimumDailyRest":
      return renderDailyRestDetails(extra, isCompliant);

    case "maximumWorkDayTime":
      return renderWorkDayTimeDetails(extra, isCompliant);

    case "enoughBreak":
      return renderBreakTimeDetails(extra, isCompliant);

    case "maximumUninterruptedWorkTime":
      return renderUninterruptedWorkDetails(extra, isCompliant);

    case "maximumWorkedDaysInWeek":
      return renderWeeklyRestDetails(extra, isCompliant);

    case "maximumWorkInCalendarWeek":
      return renderWeeklyWorkDetails(extra, isCompliant);

    default:
      return renderGenericDetails(extra);
  }
}

// Specific detail renderers for each threshold type
function renderDailyRestDetails(extra, isCompliant) {
  const requiredRestHours = extra.min_daily_rest_in_seconds
    ? Math.round(extra.min_daily_rest_in_seconds / 3600)
    : 11;
  const actualRestHours = extra.rest_duration_in_seconds
    ? Math.round(extra.rest_duration_in_seconds / 3600)
    : 0;

  return (
    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Repos requis:</strong> {requiredRestHours}h
      </div>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Repos effectif:</strong> {actualRestHours}h
      </div>
    </div>
  );
}

function renderWorkDayTimeDetails(extra, isCompliant) {
  const maxWorkHours = extra.max_work_day_time_in_seconds
    ? Math.round(extra.max_work_day_time_in_seconds / 3600)
    : 10;
  const actualWorkHours = extra.work_duration_in_seconds
    ? Math.round(extra.work_duration_in_seconds / 3600)
    : 0;

  return (
    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Durée max autorisée:</strong> {maxWorkHours}h
      </div>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Durée travaillée:</strong> {actualWorkHours}h
      </div>
    </div>
  );
}

function renderBreakTimeDetails(extra, isCompliant) {
  const requiredBreakMinutes = extra.min_break_in_seconds
    ? Math.round(extra.min_break_in_seconds / 60)
    : 45;
  const actualBreakMinutes = extra.break_duration_in_seconds
    ? Math.round(extra.break_duration_in_seconds / 60)
    : 0;

  return (
    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Pause requise:</strong> {requiredBreakMinutes} min
      </div>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Pause effectuée:</strong> {actualBreakMinutes} min
      </div>
    </div>
  );
}

function renderUninterruptedWorkDetails(extra, isCompliant) {
  const maxUninterruptedHours = extra.max_uninterrupted_work_in_seconds
    ? Math.round(extra.max_uninterrupted_work_in_seconds / 3600)
    : 6;
  const actualUninterruptedHours = extra.uninterrupted_work_in_seconds
    ? Math.round(extra.uninterrupted_work_in_seconds / 3600)
    : 0;

  return (
    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Durée max continue:</strong> {maxUninterruptedHours}h
      </div>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Durée continue:</strong> {actualUninterruptedHours}h
      </div>
    </div>
  );
}

function renderWeeklyRestDetails(extra, isCompliant) {
  const requiredRestHours = extra.min_weekly_rest_in_seconds
    ? Math.round(extra.min_weekly_rest_in_seconds / 3600)
    : 35;
  const actualRestHours = extra.weekly_rest_in_seconds
    ? Math.round(extra.weekly_rest_in_seconds / 3600)
    : 0;

  return (
    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Repos hebdo requis:</strong> {requiredRestHours}h
      </div>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Repos hebdo effectif:</strong> {actualRestHours}h
      </div>
    </div>
  );
}

function renderWeeklyWorkDetails(extra, isCompliant) {
  const maxWeeklyWorkHours = extra.max_weekly_work_in_seconds
    ? Math.round(extra.max_weekly_work_in_seconds / 3600)
    : 48;
  const actualWeeklyWorkHours = extra.work_duration_in_seconds
    ? Math.round(extra.work_duration_in_seconds / 3600)
    : 0;

  return (
    <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--gutters"))}>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Durée hebdo max:</strong> {maxWeeklyWorkHours}h
      </div>
      <div className={cx(fr.cx("fr-col-md-6"))}>
        <strong>Durée hebdo travaillée:</strong> {actualWeeklyWorkHours}h
      </div>
    </div>
  );
}

function renderGenericDetails(extra) {
  return (
    <div className={cx(fr.cx("fr-text--sm"))}>
      <pre className={cx(fr.cx("fr-text--xs"))}>
        {JSON.stringify(extra, null, 2)}
      </pre>
    </div>
  );
}

// Default props
RegulatoryThresholdItem.defaultProps = {
  thresholdType: "",
  isCompliant: false,
  thresholdData: null,
  detailed: true,
  className: ""
};
