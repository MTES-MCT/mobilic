import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { useHistory, useLocation } from "react-router-dom";
import { MobilicHeader } from "../../../common/Header";
import { Main } from "../../../common/semantics/Main";
import { usePageTitle } from "../../../common/UsePageTitle";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { CONTROLLER_TECHNICAL_INCIDENTS_QUERY } from "common/utils/apiQueries/technicalIncident";
import { TECHNICAL_INCIDENT_NATURE_LABELS } from "common/utils/technicalIncidents";
import { textualPrettyFormatDayHour, pluralize } from "common/utils/time";
import { ControllerControlBackButton } from "../utils/ControllerControlBackButton";

const useStyles = makeStyles(theme => ({
  container: {
    alignItems: "center",
    maxWidth: "100%",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      maxWidth: "80%",
      paddingLeft: theme.spacing(12.5),
      paddingRight: theme.spacing(12.5)
    }
  },
  incident: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    [theme.breakpoints.up("md")]: {
      display: "flex",
      alignItems: "center"
    }
  },
  date: {
    color: fr.colors.decisions.text.actionHigh.blueFrance.default,
    fontWeight: 700,
    "&::first-letter": {
      textTransform: "uppercase"
    },
    [theme.breakpoints.up("md")]: {
      flex: "0 0 40%"
    }
  },
  duration: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: fr.colors.decisions.text.mention.grey.default,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      flex: "0 0 25%",
      marginTop: 0,
      marginBottom: 0
    }
  },
  nature: {
    fontWeight: 500,
    [theme.breakpoints.up("md")]: {
      flex: "0 0 35%"
    }
  }
}));

function formatIncidentDuration(incident) {
  if (incident.isOngoing) {
    return "En cours";
  }
  const totalMinutes = Math.floor(
    (incident.effectiveEndTime - incident.startTime) / 60
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return pluralize(minutes, "minute");
  if (minutes === 0) return pluralize(hours, "heure");
  return `${hours}h${String(minutes).padStart(2, "0")} min`;
}

export function ControllerTechnicalIncidents() {
  usePageTitle("Dysfonctionnements techniques - Mobilic");
  const classes = useStyles();
  const api = useApi();
  const history = useHistory();
  const location = useLocation();
  const withLoadingScreen = useLoadingScreen();

  const [incidents, setIncidents] = React.useState([]);

  // Only accept an in-app relative path to avoid open redirects.
  const rawReturnTo = new URLSearchParams(location.search).get("returnTo");
  const returnTo =
    rawReturnTo && /^\/(?!\/)/.test(rawReturnTo) ? rawReturnTo : null;

  const loadIncidents = React.useCallback(async () => {
    await withLoadingScreen(async () => {
      const response = await api.graphQlQuery(
        CONTROLLER_TECHNICAL_INCIDENTS_QUERY,
        {},
        { context: { nonPublicApi: true } }
      );
      setIncidents(response.data.technicalIncidents || []);
    });
  }, [api, withLoadingScreen]);

  React.useEffect(() => {
    loadIncidents();
  }, []);

  // Scroll to the anchored incident once the list is loaded.
  React.useEffect(() => {
    if (incidents.length && location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [incidents, location.hash]);

  return (
    <>
      <MobilicHeader />
      <Main maxWidth={false}>
        <Container maxWidth={false} className={classes.container}>
          {returnTo && (
            <Box sx={{ mb: 2 }}>
              <ControllerControlBackButton
                onClick={() => history.push(returnTo)}
              >
                Retour au contrôle
              </ControllerControlBackButton>
            </Box>
          )}
          <Typography variant="h1" sx={{ fontSize: "1.5rem", mb: 2 }}>
            Registre des dysfonctionnements connus par Mobilic
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Vérifiez si une impossibilité d’enregistrement du temps de travail
            signalée par un salarié résulte d’un dysfonctionnement technique de
            la plateforme.
          </Typography>

          {incidents.length === 0 ? (
            <Typography sx={{ fontStyle: "italic" }}>
              Aucun dysfonctionnement technique connu à ce jour.
            </Typography>
          ) : (
            incidents.map(incident => (
              <Box
                key={incident.id}
                id={`incident-${incident.id}`}
                className={classes.incident}
              >
                <Typography variant="body2" className={classes.date}>
                  {textualPrettyFormatDayHour(incident.startTime, true)}
                </Typography>
                <Typography variant="body2" className={classes.duration}>
                  <span
                    className="fr-icon--sm fr-icon-time-line"
                    aria-hidden="true"
                  />
                  {formatIncidentDuration(incident)}
                </Typography>
                <Typography variant="body2" className={classes.nature}>
                  {TECHNICAL_INCIDENT_NATURE_LABELS[incident.nature] ||
                    incident.nature}
                </Typography>
              </Box>
            ))
          )}
        </Container>
      </Main>
    </>
  );
}
