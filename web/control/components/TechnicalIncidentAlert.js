import React from "react";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useHistory, useLocation } from "react-router-dom";
import { prettyFormatDay } from "common/utils/time";

// Alerts the controller that a known technical incident may have affected the
// controlled day(s), linking to the anchored registry entry.
export function TechnicalIncidentAlert({ incidents }) {
  const history = useHistory();
  const location = useLocation();

  if (!incidents || incidents.length === 0) return null;

  const dates = Array.from(
    new Set(incidents.map(i => prettyFormatDay(i.startTime)))
  ).join(", ");

  const returnTo = encodeURIComponent(location.pathname + location.search);
  // Only anchor to a specific entry when a single incident is concerned.
  const anchor = incidents.length === 1 ? `#incident-${incidents[0].id}` : "";
  const target = `/controller/technical-incidents?returnTo=${returnTo}${anchor}`;

  return (
    <Alert
      severity="error"
      title={`Des dysfonctionnements techniques ont affecté Mobilic le ${dates}`}
      description={
        <>
          {`Les problèmes d'enregistrement de temps signalés peuvent être dus à
          ces incidents. `}
          <a
            href={target}
            onClick={e => {
              e.preventDefault();
              history.push(target);
            }}
          >
            Consulter le détail
          </a>
        </>
      }
    />
  );
}
