export const TECHNICAL_INCIDENT_TYPES = [
  {
    category: "infrastructure",
    categoryLabel: "Infrastructure",
    options: [
      { value: "server_down", label: "Panne hébergeur / serveur down" },
      { value: "dns_switch", label: "Bascule / propagation DNS" },
      { value: "ssl_expired", label: "Certificat SSL expiré" },
      { value: "database_down", label: "Panne base de données" },
      { value: "backend_api_unavailable", label: "API backend indisponible" }
    ]
  },
  {
    category: "applicative",
    categoryLabel: "Applicatif",
    options: [
      { value: "slowdown_timeout", label: "Ralentissements / timeouts" },
      { value: "deploy_regression", label: "Régression après déploiement" },
      { value: "time_entry_bug", label: "Bug de saisie du temps" },
      {
        value: "offline_sync_bug",
        label: "Bug de synchronisation (hors-ligne mobile)"
      }
    ]
  },
  {
    category: "access_external",
    categoryLabel: "Accès / dépendances externes",
    options: [
      {
        value: "auth_outage",
        label: "Panne authentification (ProConnect / FranceConnect)"
      },
      { value: "email_unavailable", label: "Service email indisponible" },
      {
        value: "third_party_outage",
        label: "Dépendance tierce en panne (ex. API SIRENE)"
      }
    ]
  },
  {
    category: "special_case",
    categoryLabel: "Cas particulier",
    options: [{ value: "planned_maintenance", label: "Maintenance planifiée" }]
  }
];

export const TECHNICAL_INCIDENT_TYPE_LABELS = Object.fromEntries(
  TECHNICAL_INCIDENT_TYPES.flatMap(g =>
    g.options.map(o => [o.value, o.label])
  )
);

// Nature regroupée affichée au contrôleur (dérivée côté API depuis le type).
export const TECHNICAL_INCIDENT_NATURE_LABELS = {
  platform_unavailable: "Plateforme inaccessible",
  time_entry_impossible: "Saisie de temps impossible",
  login_impossible: "Connexion impossible",
  slowdown: "Ralentissement",
  feature_unavailable: "Fonctionnalité(s) indisponible(s)",
  planned_maintenance: "Maintenance planifiée"
};

// Incidents chevauchant la journée [dayStartUnix, dayEndUnix] (secondes).
// La fin effective est fournie par l'API (fin réelle, ou fin forcée à +24h
// pour un incident en cours).
export function incidentsOnDay(incidents, dayStartUnix, dayEndUnix) {
  if (!incidents) return [];
  return incidents.filter(
    incident =>
      incident.startTime <= dayEndUnix &&
      incident.effectiveEndTime >= dayStartUnix
  );
}

