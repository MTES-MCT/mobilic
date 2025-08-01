import React from "react";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import ComplianceIndicator, {
  CompactComplianceRow
} from "./ComplianceIndicator";
import {
  getThresholdConfig,
  formatDurationFromSeconds,
  REGULATORY_CONSTANTS
} from "./regulatoryThresholdConstants";

export default function RegulatoryThresholdItem({
  thresholdType = "",
  isCompliant = false,
  thresholdData = null,
  detailed = true,
  className = ""
}) {
  const thresholdConfig = getThresholdConfig(thresholdType);

  if (!thresholdConfig) {
    console.warn(`Unknown threshold type: ${thresholdType}`);
    return null;
  }

  const displayLabel = isCompliant
    ? thresholdConfig.label
    : thresholdConfig.labelNonCompliant || thresholdConfig.label;

  const accordionContent = (
    <div className={cx(fr.cx("fr-container"))}>
      <ComplianceIndicator
        isCompliant={isCompliant}
        thresholdLabel={displayLabel}
        thresholdExplanation={thresholdConfig.explanation}
        mode="alert"
        showDetails={true}
      />

      {thresholdData && (
        <div className={cx(fr.cx("fr-mt-2w"))}>
          <h5 className={cx(fr.cx("fr-h6", "fr-mb-1w"))}>Détails du calcul</h5>

          {renderThresholdDetails(thresholdType, thresholdData, isCompliant)}
        </div>
      )}

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

  return (
    <div className={cx(fr.cx("fr-mb-2w"), className)}>
      <Accordion
        label={
          <div className={cx(fr.cx("fr-grid-row", "fr-grid-row--middle"))}>
            <div className={cx(fr.cx("fr-col-auto", "fr-pr-2w"))}>
              <ComplianceIndicator
                isCompliant={isCompliant}
                thresholdLabel={displayLabel}
                mode="icon-only"
              />
            </div>

            <div className={cx(fr.cx("fr-col"))}>
              <span className={cx(fr.cx("fr-text--md"))}>{displayLabel}</span>
            </div>

            {thresholdType !== "enoughBreak" && (
              <div className={cx(fr.cx("fr-col-auto"))}>
                <i className={thresholdConfig.iconClass} aria-hidden="true" />
              </div>
            )}
          </div>
        }
      >
        {accordionContent}
      </Accordion>
    </div>
  );
}

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

function renderDailyRestDetails(extra, isCompliant) {
  const requiredRestHours = formatDurationFromSeconds.toHours(
    extra.min_daily_rest_in_seconds,
    REGULATORY_CONSTANTS.DEFAULT_DAILY_REST_HOURS
  );
  const actualRestHours = formatDurationFromSeconds.toHours(
    extra.rest_duration_in_seconds,
    0
  );

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
  const maxWorkHours = formatDurationFromSeconds.toHours(
    extra.max_work_day_time_in_seconds,
    REGULATORY_CONSTANTS.DEFAULT_MAX_WORK_DAY_HOURS
  );
  const actualWorkHours = formatDurationFromSeconds.toHours(
    extra.work_duration_in_seconds,
    0
  );

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
  const requiredBreakMinutes = formatDurationFromSeconds.toMinutes(
    extra.min_break_in_seconds,
    REGULATORY_CONSTANTS.DEFAULT_BREAK_MINUTES
  );
  const actualBreakMinutes = formatDurationFromSeconds.toMinutes(
    extra.break_duration_in_seconds,
    0
  );

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
  const maxUninterruptedHours = formatDurationFromSeconds.toHours(
    extra.max_uninterrupted_work_in_seconds,
    REGULATORY_CONSTANTS.DEFAULT_MAX_UNINTERRUPTED_WORK_HOURS
  );
  const actualUninterruptedHours = formatDurationFromSeconds.toHours(
    extra.uninterrupted_work_in_seconds,
    0
  );

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
  const requiredRestHours = formatDurationFromSeconds.toHours(
    extra.min_weekly_rest_in_seconds,
    REGULATORY_CONSTANTS.DEFAULT_WEEKLY_REST_HOURS
  );
  const actualRestHours = formatDurationFromSeconds.toHours(
    extra.weekly_rest_in_seconds,
    0
  );

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
  const maxWeeklyWorkHours = formatDurationFromSeconds.toHours(
    extra.max_weekly_work_in_seconds,
    REGULATORY_CONSTANTS.DEFAULT_MAX_WEEKLY_WORK_HOURS
  );
  const actualWeeklyWorkHours = formatDurationFromSeconds.toHours(
    extra.work_duration_in_seconds,
    0
  );

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
