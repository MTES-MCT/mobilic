import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { MobilicHeader } from "../common/Header";
import { Main } from "../common/semantics/Main";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { usePageTitle } from "../common/UsePageTitle";
import { useHistory } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { getFallbackRoute } from "../common/routes";
import {
  TECHNICAL_INCIDENT_TYPES,
  TECHNICAL_INCIDENT_TYPE_LABELS,
  TECHNICAL_INCIDENT_NATURE_LABELS
} from "common/utils/technicalIncidents";
import {
  TECHNICAL_INCIDENTS_QUERY,
  CREATE_TECHNICAL_INCIDENT_MUTATION,
  RESOLVE_TECHNICAL_INCIDENT_MUTATION
} from "common/utils/apiQueries/technicalIncident";
import { prettyFormatDayHour } from "common/utils/time";

const MAX_DESCRIPTION = 2000;

const toTimeStamp = value =>
  value ? Math.floor(new Date(value).getTime() / 1000) : null;

export default function TechnicalIncidentsAdmin() {
  usePageTitle("Support - Dysfonctionnements techniques - Mobilic");
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const history = useHistory();

  const [technicalType, setTechnicalType] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [incidents, setIncidents] = React.useState([]);

  const userInfo = store.userInfo();
  const companies = store.companies();

  React.useEffect(() => {
    if (
      userInfo?.id &&
      ((!userInfo?.admin && !userInfo?.bizdev) || !userInfo?.totpEnabled)
    ) {
      history.replace(
        getFallbackRoute({
          userInfo,
          companies,
          controllerInfo: store.controllerInfo()
        })
      );
    }
  }, [userInfo, companies, history, store]);

  const loadIncidents = React.useCallback(async () => {
    try {
      const response = await api.graphQlQuery(
        TECHNICAL_INCIDENTS_QUERY,
        {},
        { context: { nonPublicApi: true } }
      );
      setIncidents(response.data.technicalIncidents || []);
    } catch {
      setIncidents([]);
    }
  }, [api]);

  React.useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const canSubmit = technicalType && startTime;

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      await api.graphQlMutate(
        CREATE_TECHNICAL_INCIDENT_MUTATION,
        {
          technicalType,
          startTime: toTimeStamp(startTime),
          endTime: toTimeStamp(endTime),
          description: description.trim() || null
        },
        { context: { nonPublicApi: true } }
      );
      setResult("success");
      setTechnicalType("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      await loadIncidents();
    } catch (err) {
      setResult(err?.message || "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async incident => {
    try {
      await api.graphQlMutate(
        RESOLVE_TECHNICAL_INCIDENT_MUTATION,
        {
          incidentId: incident.id,
          endTime: Math.floor(Date.now() / 1000)
        },
        { context: { nonPublicApi: true } }
      );
      await loadIncidents();
    } catch {
      setResult("error");
    }
  };

  const tableData = incidents.map(incident => [
    prettyFormatDayHour(incident.startTime),
    incident.endTime ? prettyFormatDayHour(incident.endTime) : "En cours",
    TECHNICAL_INCIDENT_TYPE_LABELS[incident.technicalType] ||
      incident.technicalType,
    TECHNICAL_INCIDENT_NATURE_LABELS[incident.nature] || incident.nature,
    incident.endTime ? (
      "—"
    ) : (
      <Button
        size="small"
        priority="secondary"
        onClick={() => handleResolve(incident)}
      >
        Clôturer
      </Button>
    )
  ]);

  return (
    <>
      <MobilicHeader />
      <Main>
        <PaperContainer>
          <Container maxWidth="lg">
            <PaperContainerTitle variant="h1" sx={{ textAlign: "center" }}>
              Dysfonctionnements techniques
            </PaperContainerTitle>

            <Box sx={{ padding: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Enregistrer un dysfonctionnement
              </Typography>

              <Select
                label="Nature technique"
                nativeSelectProps={{
                  value: technicalType,
                  onChange: e => setTechnicalType(e.target.value)
                }}
              >
                <option value="" disabled>
                  Sélectionnez une nature
                </option>
                {TECHNICAL_INCIDENT_TYPES.map(group => (
                  <optgroup key={group.category} label={group.categoryLabel}>
                    {group.options.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>

              <Input
                label="Début du dysfonctionnement"
                nativeInputProps={{
                  type: "datetime-local",
                  value: startTime,
                  onChange: e => setStartTime(e.target.value)
                }}
              />
              <Input
                label="Fin du dysfonctionnement (laisser vide si en cours)"
                nativeInputProps={{
                  type: "datetime-local",
                  value: endTime,
                  onChange: e => setEndTime(e.target.value)
                }}
              />
              <Input
                label="Description (optionnelle)"
                textArea
                nativeTextAreaProps={{
                  value: description,
                  onChange: e => setDescription(e.target.value),
                  maxLength: MAX_DESCRIPTION,
                  rows: 2
                }}
              />

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
              >
                Enregistrer
              </Button>

              {result === "success" && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity="success"
                    small
                    description="Dysfonctionnement enregistré."
                  />
                </Box>
              )}
              {result && result !== "success" && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    severity="error"
                    small
                    description={
                      result === "error"
                        ? "Une erreur est survenue."
                        : result
                    }
                  />
                </Box>
              )}

              <Typography variant="h6" sx={{ fontWeight: 700, mt: 4, mb: 2 }}>
                Registre actuel
              </Typography>
              <Table
                fixed
                noCaption
                headers={[
                  "Début",
                  "Fin",
                  "Type technique",
                  "Nature affichée",
                  "Action"
                ]}
                data={tableData}
              />
            </Box>
          </Container>
        </PaperContainer>
      </Main>
    </>
  );
}
