import React from "react";
import Box from "@mui/material/Box";
import { useHistory, useLocation } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import Notice from "../../common/Notice";
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
    <Notice
      type="warning"
      title={`Des dysfonctionnements techniques ont affecté Mobilic le ${dates}`}
      description={
        <>
          <Box component="span" sx={{ display: "block" }}>
            {`Les problèmes d'enregistrement de temps signalés peuvent être dus à
            ces incidents.`}
          </Box>
          <a
            href={target}
            className={fr.cx("fr-notice__link")}
            style={{ display: "inline-block", marginTop: "0.25rem" }}
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
