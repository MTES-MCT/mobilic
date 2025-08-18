import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

export const REGULATORY_THRESHOLD_TYPES = {
  MINIMUM_DAILY_REST: {
    backendType: "minimumDailyRest",
    label: "Repos journalier respecté",
    labelNonCompliant: "Repos journalier non respecté",
    category: "daily",
    explanation:
      "Repos minimal de 11 heures consécutives entre deux périodes de travail.",
    iconClass: cx(fr.cx("fr-icon-time-line")),
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
    labelNonCompliant: "Temps de pause non respecté",
    category: "daily",
    explanation:
      "Pause minimale de 45 minutes après 6 heures de travail consécutif.",
    iconClass: cx(fr.cx("fr-icon-pause-line")),
    pictogram: "break-time"
  },
  MAXIMUM_UNINTERRUPTED_WORK_TIME: {
    backendType: "maximumUninterruptedWorkTime",
    label: "Durée maximale de travail ininterrompu respectée",
    labelNonCompliant: "Durée maximale de travail ininterrompu non respectée",
    explanation: "Durée maximale de travail sans interruption de 6 heures.",
    iconClass: cx(fr.cx("fr-icon-timer-line")),
    pictogram: "uninterrupted-work"
  },
  MAXIMUM_WORKED_DAYS_IN_WEEK: {
    backendType: "maximumWorkedDaysInWeek",
    label: "Repos hebdomadaire respecté",
    labelNonCompliant: "Repos hebdomadaire non respecté",
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

export const THRESHOLDS_BY_CATEGORY = {
  daily: [
    "minimumDailyRest",
    "maximumWorkDayTime",
    "enoughBreak",
    "maximumUninterruptedWorkTime"
  ],
  weekly: ["maximumWorkedDaysInWeek", "maximumWorkInCalendarWeek"]
};

export const CATEGORY_LABELS = {
  daily: "Seuils journaliers",
  weekly: "Seuils hebdomadaires"
};

export const GRID_CLASSES = {
  container: cx(fr.cx("fr-grid-row", "fr-grid-row--gutters")),
  column: cx(fr.cx("fr-col-md-6")),
  fullWidth: cx(fr.cx("fr-col-12"))
};

export const REGULATORY_CONSTANTS = {
  DEFAULT_DAILY_REST_HOURS: 11,
  DEFAULT_MAX_WORK_DAY_HOURS: 10,
  DEFAULT_BREAK_MINUTES: 45,
  DEFAULT_MAX_UNINTERRUPTED_WORK_HOURS: 6,
  DEFAULT_WEEKLY_REST_HOURS: 35,
  DEFAULT_MAX_WEEKLY_WORK_HOURS: 48
};

export const formatDurationFromSeconds = {
  toHours: (seconds, defaultValue = 0) => {
    if (seconds === null || seconds === undefined) return defaultValue;
    if (typeof seconds !== "number") return defaultValue;
    return Math.round(seconds / 3600);
  },

  toMinutes: (seconds, defaultValue = 0) => {
    if (seconds === null || seconds === undefined) return defaultValue;
    if (typeof seconds !== "number") return defaultValue;
    return Math.round(seconds / 60);
  },

  toHoursAndMinutes: seconds => {
    if (!seconds && seconds !== 0) return { hours: 0, minutes: 0 };
    const totalMinutes = Math.round(seconds / 60);
    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    };
  }
};

export function formatEmployeeName(employee) {
  if (!employee) return "";
  return `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
}

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
 * Get the appropriate label based on compliance status
 * @param {string} backendType
 * @param {boolean} isCompliant
 * @returns {string}
 */
export function getThresholdLabel(backendType, isCompliant) {
  const config = getThresholdConfig(backendType);
  if (!config) return "Seuil inconnu";

  return isCompliant ? config.label : config.labelNonCompliant;
}

/**
 * Helper function to get thresholds by category
 * @param {string} category - "daily" or "weekly"
 * @returns {array} Array of threshold configurations
 */
export function getThresholdsByCategory(category) {
  return THRESHOLDS_BY_CATEGORY[category]
    .map(backendType => {
      return Object.values(REGULATORY_THRESHOLD_TYPES).find(
        threshold => threshold.backendType === backendType
      );
    })
    .filter(Boolean);
}
