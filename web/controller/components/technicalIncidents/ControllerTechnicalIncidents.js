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
import { TECHNICAL_INCIDENTS_QUERY } from "common/utils/apiQueries/technicalIncident";
import { TECHNICAL_INCIDENT_NATURE_LABELS } from "common/utils/technicalIncidents";
import {
  textualPrettyFormatDayHour,
  pluralize,
  addZero
} from "common/utils/time";
import { ControllerControlBackButton } from "../utils/ControllerControlBackButton";

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(7),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  incident: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`
  },
  date: {
    color: fr.colors.decisions.text.actionHigh.blueFrance.default,
    fontWeight: 700
  },
  duration: {
    color: fr.colors.decisions.text.mention.grey.default,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5)
  },
  nature: {
    fontWeight: 500
  }
}));

function formatIncidentDuration(incident) {
  if (!incident.endTime) {
    return "En cours";
  }
  const totalMinutes = Math.trunc((incident.endTime - incident.startTime) / 60);
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h${addZero(minutes)} min`;
  }
  if (hours > 0) {
    return pluralize(hours, "heure");
  }
  return pluralize(minutes, "minute");
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

  // Fetch once on mount: withLoadingScreen/api change identity on every render,
  // adding them as deps would loop the request.
  React.useEffect(() => {
    withLoadingScreen(async () => {
      const response = await api.graphQlQuery(
        TECHNICAL_INCIDENTS_QUERY,
        {},
        { context: { nonPublicApi: true } }
      );
      setIncidents(response.data.technicalIncidents || []);
    });
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
      <Main>
        <Container maxWidth="md" className={classes.container}>
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
            Registre des dysfonctionnements techniques connus par Mobilic
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Consultez ce registre pour établir si un problème d'enregistrement
            de temps signalé par un salarié résulte d'un dysfonctionnement
            technique de la plateforme.
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
                <Typography className={classes.date}>
                  {textualPrettyFormatDayHour(incident.startTime, true)}
                </Typography>
                <Typography variant="body2" className={classes.duration}>
                  {formatIncidentDuration(incident)}
                </Typography>
                <Typography variant="body2" className={classes.nature}>
                  {TECHNICAL_INCIDENT_NATURE_LABELS[incident.nature] ||
                    incident.nature}
                </Typography>
                {incident.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {incident.description}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Container>
      </Main>
    </>
  );
}
