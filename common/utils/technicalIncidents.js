// Technical type stored per nature (the nature itself is derived from it on the API).
export const NATURE_TO_TECHNICAL_TYPE = {
  platform_unavailable: "server_down",
  time_entry_impossible: "time_entry_bug",
  login_impossible: "auth_outage",
  slowdown: "slowdown_timeout",
  feature_unavailable: "backend_api_unavailable",
  planned_maintenance: "planned_maintenance"
};

export const TECHNICAL_INCIDENT_NATURE_LABELS = {
  platform_unavailable: "Plateforme inaccessible",
  time_entry_impossible: "Saisie de temps impossible",
  login_impossible: "Connexion impossible",
  slowdown: "Ralentissement",
  feature_unavailable: "Fonctionnalité(s) indisponible(s)",
  planned_maintenance: "Maintenance planifiée"
};

// Incidents overlapping the day [dayStartUnix, dayEndUnix] (in seconds).
// The effective end is provided by the API (real end, or the current time
// for an incident that is still ongoing).
export function incidentsOnDay(incidents, dayStartUnix, dayEndUnix) {
  if (!incidents) return [];
  return incidents.filter(
    incident =>
      incident.startTime <= dayEndUnix &&
      incident.effectiveEndTime >= dayStartUnix
  );
}

