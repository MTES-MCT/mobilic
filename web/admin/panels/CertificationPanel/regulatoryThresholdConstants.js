import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

/**
 * Regulatory Threshold Constants - DSFR v1.26 Compatible
 * Mapping backend Python types to frontend French labels with DSFR styling
 * Based on analysis from backend documentation and Figma designs
 */

export const REGULATORY_THRESHOLD_TYPES = {
  MINIMUM_DAILY_REST: {
    backendType: "minimumDailyRest",
    label: "Repos journalier respecté",
    labelNonCompliant: "Repos journalier non respecté",
    category: "daily",
    explanation:
      "Repos minimal de 11 heures consécutives entre deux périodes de travail.",
    iconClass: cx(fr.cx("fr-icon-time-line")),
    // DSFR v1.26: Support for pictograms v2
    pictogram: "rest-daily"
  },
  MAXIMUM_WORK_DAY_TIME: {
    backendType: "maximumWorkDayTime",
    label: "Durée du travail quotidien respectée",
    labelNonCompliant: "Durée du travail quotidien non respectée",
    category: "daily",
    explanation: "Durée maximale de travail de 10 heures par jour.",
    iconClass: cx(fr.cx("fr-icon-calendar-line")),
    pictogram: "work-day-time"
  },
  ENOUGH_BREAK: {
    backendType: "enoughBreak",
    label: "Temps de pause respecté",
    labelNonCompliant: "Temps de pause respecté", // Note: This shows as "respecté" even in non-compliant state in Figma
    category: "daily",
    explanation:
      "Pause minimale de 45 minutes après 6 heures de travail consécutif.",
    iconClass: cx(fr.cx("fr-icon-pause-line")),
    pictogram: "break-time"
  },
  MAXIMUM_UNINTERRUPTED_WORK_TIME: {
    backendType: "maximumUninterruptedWorkTime",
    label: "Durée maximale de travail ininterrompu respectée",
    labelNonCompliant: "Durée maximale de travail ininterrompu respectée", // Note: Shows as "respectée" in Figma
    category: "daily",
    explanation: "Durée maximale de travail sans interruption de 6 heures.",
    iconClass: cx(fr.cx("fr-icon-timer-line")),
    pictogram: "uninterrupted-work"
  },
  MAXIMUM_WORKED_DAYS_IN_WEEK: {
    backendType: "maximumWorkedDaysInWeek",
    label: "Repos hebdomadaire respecté",
    labelNonCompliant: "Repos hebdomadaire respecté", // Note: Shows as "respecté" in Figma
    category: "weekly",
    explanation: "Repos hebdomadaire minimal de 35 heures consécutives.",
    iconClass: cx(fr.cx("fr-icon-calendar-2-line")),
    pictogram: "weekly-rest"
  },
  MAXIMUM_WORK_IN_CALENDAR_WEEK: {
    backendType: "maximumWorkInCalendarWeek",
    label: "Durée du travail hebdomadaire respectée",
    labelNonCompliant: "Durée du travail hebdomadaire non respectée",
    category: "weekly",
    explanation: "Durée maximale de travail de 48 heures par semaine.",
    iconClass: cx(fr.cx("fr-icon-time-line")),
    pictogram: "weekly-work"
  }
};

/**
 * Thresholds organized by category for two-column layout
 * Matches exact Figma design: "Seuils journaliers" | "Seuils hebdomadaires"
 */
export const THRESHOLDS_BY_CATEGORY = {
  daily: [
    "MINIMUM_DAILY_REST",
    "MAXIMUM_WORK_DAY_TIME",
    "ENOUGH_BREAK",
    "MAXIMUM_UNINTERRUPTED_WORK_TIME"
  ],
  weekly: ["MAXIMUM_WORKED_DAYS_IN_WEEK", "MAXIMUM_WORK_IN_CALENDAR_WEEK"]
};

/**
 * Exact Figma label mapping from certificate screenshots
 * Maps displayed text to backend types for precise UI matching
 */
export const FIGMA_TO_BACKEND_LABELS = {
  // From certificat_*_regulation.png screenshots:
  "Temps de pause respecté": "enoughBreak",
  "Durée maximale de travail ininterrompu respectée":
    "maximumUninterruptedWorkTime",
  "Repos journalier non respecté": "minimumDailyRest", // ⚠️ state
  "Durée du travail quotidien non respectée": "maximumWorkDayTime", // ⚠️ state
  "Repos hebdomadaire respecté": "maximumWorkedDaysInWeek",
  "Durée du travail hebdomadaire non respectée": "maximumWorkInCalendarWeek" // ⚠️ state
};

/**
 * Tab labels exactly as shown in Figma designs
 * Used for DSFR v1.26 Tabs component
 */
export const TAB_LABELS = {
  criteria: "Détail des critères", // 📷 Left tab in all designs
  thresholds: "Respect des seuils réglementaires" // 📷 Right tab in all designs
};

/**
 * DSFR v1.26 compliance status styling
 * Based on Figma visual states: ✅/⚠️ patterns
 */
export const COMPLIANCE_STATUS = {
  COMPLIANT: {
    severity: "success",
    icon: "✅",
    label: "Conforme",
    className: cx(fr.cx("fr-alert--success"))
  },
  NON_COMPLIANT: {
    severity: "error",
    icon: "⚠️",
    label: "Non conforme",
    className: cx(fr.cx("fr-alert--error"))
  }
};

/**
 * Category labels for two-column layout headers
 * Exact text from Figma designs
 */
export const CATEGORY_LABELS = {
  daily: "Seuils journaliers",
  weekly: "Seuils hebdomadaires"
};

/**
 * DSFR v1.26 Grid classes for consistent layout
 * Used throughout regulatory components
 */
export const GRID_CLASSES = {
  container: cx(fr.cx("fr-grid-row", "fr-grid-row--gutters")),
  column: cx(fr.cx("fr-col-md-6")),
  fullWidth: cx(fr.cx("fr-col-12"))
};

/**
 * Helper function to get threshold configuration by backend type
 * @param {string} backendType - Backend threshold type
 * @returns {object} Threshold configuration object
 */
export function getThresholdConfig(backendType) {
  return Object.values(REGULATORY_THRESHOLD_TYPES).find(
    threshold => threshold.backendType === backendType
  );
}

/**
 * Helper function to get compliance status styling
 * @param {boolean} isCompliant - Compliance status
 * @returns {object} DSFR styling configuration
 */
export function getComplianceStatus(isCompliant) {
  return isCompliant
    ? COMPLIANCE_STATUS.COMPLIANT
    : COMPLIANCE_STATUS.NON_COMPLIANT;
}

/**
 * Helper function to get thresholds by category
 * @param {string} category - "daily" or "weekly"
 * @returns {array} Array of threshold configurations
 */
export function getThresholdsByCategory(category) {
  return THRESHOLDS_BY_CATEGORY[category].map(
    type => REGULATORY_THRESHOLD_TYPES[type]
  );
}
