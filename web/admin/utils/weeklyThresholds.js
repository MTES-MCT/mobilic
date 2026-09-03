import { fr } from "@codegouvfr/react-dsfr";

const THRESHOLD_MARGIN = 4 * 3600;

// fallback values if the API hasn't responded yet
const DEFAULTS = { maxWorkInHours: 48, minRestInHours: 34, maxWorkedDays: 6 };

export function getThresholds(weeklyThresholds) {
  const t = weeklyThresholds || DEFAULTS;
  const maxWorkSeconds = t.maxWorkInHours * 3600;
  const minRestSeconds = t.minRestInHours * 3600;
  return {
    work: {
      warnAt: maxWorkSeconds - THRESHOLD_MARGIN,
      errorAt: maxWorkSeconds,
      warnTooltip: `Approche de la durée maximale hebdomadaire (${t.maxWorkInHours}h)`,
      errorTooltip: `Durée maximale hebdomadaire dépassée (${t.maxWorkInHours}h)`
    },
    rest: {
      min: true,
      warnAt: minRestSeconds + THRESHOLD_MARGIN,
      errorAt: minRestSeconds,
      warnTooltip: `Approche du repos hebdomadaire minimum (${t.minRestInHours} h)`,
      errorTooltip: `Repos hebdomadaire minimum non respecté (${t.minRestInHours} h)`
    },
    workedDays: {
      warnAt: t.maxWorkedDays,
      errorAt: t.maxWorkedDays + 1,
      warnTooltip: "Le dimanche doit rester entièrement non travaillé",
      errorTooltip: "Aucun jour de repos complet sur la semaine civile"
    }
  };
}

function getThresholdLevel(value, { min, warnAt, errorAt }) {
  if (min) {
    if (value < errorAt) return "error";
    if (value <= warnAt) return "warning";
  } else {
    if (value >= errorAt) return "error";
    if (value >= warnAt) return "warning";
  }
  return null;
}

export function getThresholdDisplay(value, thresholdKey, thresholds) {
  const config = thresholds[thresholdKey];
  const level = getThresholdLevel(value, config);
  if (!level) return null;
  const isError = level === "error";
  return {
    color: isError
      ? fr.colors.decisions.background.flat.error.default
      : fr.colors.decisions.text.default.warning.default,
    icon: isError ? "fr-icon-error-line" : "fr-icon-error-warning-line",
    tooltip: isError ? config.errorTooltip : config.warnTooltip
  };
}
