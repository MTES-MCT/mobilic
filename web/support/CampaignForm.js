import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { fr } from "@codegouvfr/react-dsfr";
import { useApi } from "common/utils/api";
import {
  CREATE_NOTIFICATION_CAMPAIGN_MUTATION,
  SEARCH_USERS_FOR_CAMPAIGN_QUERY
} from "common/utils/apiQueries/notificationCampaign";

const TARGET_OPTIONS = [
  { label: "Tous les utilisateurs", value: "all_users" },
  { label: "Tous les salariés", value: "all_employees" },
  { label: "Tous les gestionnaires", value: "all_managers" },
  { label: "Salariés spécifiques", value: "specific_employees" },
  {
    label: "Gestionnaires spécifiques",
    value: "specific_managers"
  }
];

const TARGET_LABELS = Object.fromEntries(
  TARGET_OPTIONS.map(o => [o.value, o.label])
);

const MAX_TITLE = 100;
const MAX_BODY = 500;
const borderGrey = fr.colors.decisions.border.default.grey.default;
const mentionGrey = fr.colors.decisions.text.mention.grey.default;

const labelSx = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: mentionGrey,
  marginBottom: 0.5
};

export default function CampaignForm({ onCreated }) {
  const api = useApi();

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [targetType, setTargetType] = React.useState("all_users");
  const [scheduled, setScheduled] = React.useState(false);
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [emailsInput, setEmailsInput] = React.useState("");
  const [emailsLoading, setEmailsLoading] = React.useState(false);
  const [pickerMode, setPickerMode] = React.useState("search");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [emailsWarning, setEmailsWarning] = React.useState(null);

  const isSpecific =
    targetType === "specific_employees" ||
    targetType === "specific_managers";

  const searchTargetType =
    targetType === "specific_employees"
      ? "specific_employees"
      : "specific_managers";

  const canSubmit =
    title.trim() &&
    body.trim() &&
    (!isSpecific || selectedUsers.length > 0) &&
    (!scheduled || scheduledAt);

  const handleSearch = async e => {
    if (e) e.preventDefault();
    if (searchInput.length < 3) return;
    setSearchLoading(true);
    try {
      const response = await api.graphQlQuery(
        SEARCH_USERS_FOR_CAMPAIGN_QUERY,
        {
          search: searchInput,
          targetType: searchTargetType
        },
        { context: { nonPublicApi: true } }
      );
      setSearchResults(
        response.data.searchUsersForCampaign.results || []
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResolveEmails = async () => {
    const rawEmails = emailsInput
      .split(/[,;\s]+/)
      .map(e => e.trim())
      .filter(Boolean);
    if (rawEmails.length === 0) return;
    setEmailsLoading(true);
    setEmailsWarning(null);

    const uniqueEmails = [
      ...new Set(rawEmails.map(e => e.toLowerCase()))
    ];
    const duplicateCount = rawEmails.length - uniqueEmails.length;

    const found = [];
    for (const email of uniqueEmails) {
      try {
        const response = await api.graphQlQuery(
          SEARCH_USERS_FOR_CAMPAIGN_QUERY,
          {
            search: email,
            targetType: searchTargetType
          },
          { context: { nonPublicApi: true } }
        );
        const results =
          response.data.searchUsersForCampaign.results || [];
        const exact = results.find(
          u => u.email.toLowerCase() === email
        );
        if (exact) found.push(exact);
      } catch {
        // skip
      }
    }
    const existing = new Set(selectedUsers.map(u => u.id));
    const newUsers = found.filter(u => !existing.has(u.id));
    const alreadySelected = found.length - newUsers.length;
    setSelectedUsers(prev => [...prev, ...newUsers]);
    setEmailsInput("");
    setEmailsLoading(false);

    const warnings = [];
    if (duplicateCount > 0) {
      warnings.push(
        `${duplicateCount} doublon(s) ignoré(s)`
      );
    }
    if (alreadySelected > 0) {
      warnings.push(
        `${alreadySelected} déjà sélectionné(s)`
      );
    }
    const notFound = uniqueEmails.length - found.length;
    if (notFound > 0) {
      warnings.push(
        `${notFound} email(s) non trouvé(s)`
      );
    }
    if (warnings.length > 0) {
      setEmailsWarning(warnings.join(", "));
    }
  };

  const toggleUser = user => {
    setSelectedUsers(prev => {
      const exists = prev.some(u => u.id === user.id);
      if (exists) return prev.filter(u => u.id !== user.id);
      return [...prev, user];
    });
  };

  const removeUser = userId => {
    setSelectedUsers(prev =>
      prev.filter(u => u.id !== userId)
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    try {
      const variables = {
        title: title.trim(),
        body: body.trim(),
        targetType
      };
      if (isSpecific) {
        variables.targetUserIds = selectedUsers.map(u => u.id);
      }
      if (scheduled && scheduledAt) {
        variables.scheduledAt = Math.floor(
          new Date(scheduledAt).getTime() / 1000
        );
      }
      await api.graphQlMutate(
        CREATE_NOTIFICATION_CAMPAIGN_MUTATION,
        variables,
        { context: { nonPublicApi: true } }
      );
      setResult(scheduled ? "scheduled" : "success");
      setTitle("");
      setBody("");
      setTargetType("all_users");
      setSelectedUsers([]);
      setScheduled(false);
      setScheduledAt("");
      setSearchResults([]);
      setEmailsInput("");
      if (onCreated) onCreated();
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <Box>
      <Input
        label="Titre de la notification"
        nativeInputProps={{
          value: title,
          onChange: e => setTitle(e.target.value),
          maxLength: MAX_TITLE,
          placeholder: "Ex: Nouvelle fonctionnalité disponible"
        }}
      />
      <Input
        label="Message"
        textArea
        nativeTextAreaProps={{
          value: body,
          onChange: e => setBody(e.target.value),
          maxLength: MAX_BODY,
          rows: 3,
          placeholder: "Contenu de la notification"
        }}
      />
      <RadioButtons
        legend="Destinataires"
        options={TARGET_OPTIONS.map(o => ({
          label: o.label,
          nativeInputProps: {
            value: o.value,
            checked: targetType === o.value,
            onChange: () => {
              setTargetType(o.value);
              setSelectedUsers([]);
              setSearchResults([]);
            }
          }
        }))}
      />
      {isSpecific && (
        <Box
          sx={{
            padding: 2,
            marginBottom: 2,
            border: `1px solid ${borderGrey}`,
            borderRadius: 1
          }}
        >
          <Box sx={{ display: "flex", gap: 1, marginBottom: 2 }}>
            <Button
              size="small"
              priority={
                pickerMode === "search" ? "primary" : "secondary"
              }
              onClick={() => setPickerMode("search")}
            >
              Rechercher
            </Button>
            <Button
              size="small"
              priority={
                pickerMode === "emails" ? "primary" : "secondary"
              }
              onClick={() => setPickerMode("emails")}
            >
              Coller des emails
            </Button>
          </Box>
          {pickerMode === "search" && (
            <Box>
              <form onSubmit={handleSearch}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-end"
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      "& .fr-input-group": { marginBottom: 0 }
                    }}
                  >
                    <Input
                      label=""
                      nativeInputProps={{
                        placeholder:
                          "Nom, prénom ou email (min. 3 caractères)",
                        value: searchInput,
                        onChange: e =>
                          setSearchInput(e.target.value)
                      }}
                    />
                  </Box>
                  <Button
                    type="submit"
                    size="small"
                    disabled={
                      searchInput.length < 3 || searchLoading
                    }
                  >
                    {searchLoading
                      ? "Recherche…"
                      : "Rechercher"}
                  </Button>
                </Box>
              </form>
              {searchResults.length > 0 && (
                <Box sx={{ marginTop: 2 }}>
                  <Table
                    noCaption
                    bordered
                    fixed
                    headers={["", "Nom", "Email"]}
                    data={searchResults.map(user => {
                      const isSelected = selectedUsers.some(
                        u => u.id === user.id
                      );
                      return [
                        <input
                          key={user.id}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUser(user)}
                          aria-label={`Sélectionner ${user.firstName} ${user.lastName}`}
                        />,
                        `${user.firstName} ${user.lastName}`,
                        user.email
                      ];
                    })}
                  />
                </Box>
              )}
            </Box>
          )}
          {pickerMode === "emails" && (
            <Box>
              <Input
                label="Adresses email (séparées par des virgules ou retours à la ligne)"
                textArea
                nativeTextAreaProps={{
                  value: emailsInput,
                  onChange: e => setEmailsInput(e.target.value),
                  rows: 4,
                  placeholder:
                    "email1@exemple.fr, email2@exemple.fr"
                }}
              />
              <Button
                size="small"
                onClick={handleResolveEmails}
                disabled={!emailsInput.trim() || emailsLoading}
              >
                {emailsLoading ? "Résolution…" : "Valider"}
              </Button>
              {emailsWarning && (
                <Typography
                  variant="body2"
                  sx={{
                    marginTop: 1,
                    color:
                      mentionGrey
                  }}
                >
                  {emailsWarning}
                </Typography>
              )}
            </Box>
          )}
          {selectedUsers.length > 0 && (
            <Box sx={{ marginTop: 2 }}>
              <Typography
                variant="body2"
                sx={{ marginBottom: 1 }}
              >
                {selectedUsers.length} utilisateur(s)
                sélectionné(s)
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
              >
                {selectedUsers.map(user => (
                  <Chip
                    key={user.id}
                    label={`${user.firstName} ${user.lastName}`}
                    onDelete={() => removeUser(user.id)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
      <Box sx={{ marginBottom: 1, "& .fr-fieldset": { marginBottom: 0 } }}>
        <Checkbox
          options={[
            {
              label: "Programmer l'envoi",
              nativeInputProps: {
                checked: scheduled,
                onChange: e => setScheduled(e.target.checked)
              }
            }
          ]}
        />
      </Box>
      {scheduled && (
        <Box sx={{ marginTop: 1, marginBottom: 1 }}>
          <Input
            label="Date et heure d'envoi"
            nativeInputProps={{
              type: "datetime-local",
              value: scheduledAt,
              onChange: e => setScheduledAt(e.target.value),
              min: new Date().toISOString().slice(0, 16)
            }}
          />
        </Box>
      )}
      <Box sx={{ marginTop: 2 }}>
        <Button
          size="small"
          onClick={() => setConfirmOpen(true)}
          disabled={!canSubmit || submitting}
        >
          {scheduled ? "Programmer" : "Envoyer"}
        </Button>
      </Box>
      {result && (
        <Box sx={{ marginTop: 3 }}>
          <Alert
            severity={result === "error" ? "error" : "success"}
            title={
              result === "scheduled"
                ? "Campagne programmée."
                : result === "success"
                  ? "Campagne lancée."
                  : "Une erreur est survenue."
            }
            small
          />
        </Box>
      )}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ padding: 0 }}>
          <Box
            sx={{
              padding: 3,
              backgroundColor:
                fr.colors.decisions.background.alt.grey.default,
              borderBottom: `1px solid ${borderGrey}`
            }}
          >
            <Typography
              sx={{ fontWeight: 700, fontSize: "1.1rem" }}
            >
              {scheduled
                ? "Confirmer la programmation"
                : "Confirmer l'envoi"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color:
                  mentionGrey,
                marginTop: 0.5
              }}
            >
              {scheduled
                ? "La campagne sera envoyée à la date indiquée."
                : "La campagne sera envoyée immédiatement."}
            </Typography>
          </Box>
          <Box sx={{ padding: 3 }}>
            <Typography
              variant="body2"
              sx={labelSx}
            >
              Titre
            </Typography>
            <Typography
              sx={{ fontWeight: 500, marginBottom: 2 }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={labelSx}
            >
              Message
            </Typography>
            <Typography
              sx={{
                padding: 2,
                border: `1px solid ${borderGrey}`,
                borderRadius: 1,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                marginBottom: 2
              }}
            >
              {body}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexWrap: "wrap"
              }}
            >
              <Box sx={{ flex: 1, minWidth: 120 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color:
                      mentionGrey,
                    marginBottom: 0.5
                  }}
                >
                  Destinataires
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {TARGET_LABELS[targetType] || targetType}
                  {isSpecific &&
                    ` (${selectedUsers.length})`}
                </Typography>
              </Box>
              {scheduled && scheduledAt && (
                <Box sx={{ flex: 1, minWidth: 120 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color:
                        mentionGrey,
                      marginBottom: 0.5
                    }}
                  >
                    Envoi programmé
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {new Date(scheduledAt).toLocaleString(
                      "fr-FR"
                    )}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            padding: 3,
            paddingTop: 0,
            gap: 1
          }}
        >
          <Button
            priority="secondary"
            size="small"
            onClick={() => setConfirmOpen(false)}
          >
            Annuler
          </Button>
          <Button
            size="small"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? "Envoi…"
              : scheduled
                ? "Programmer"
                : "Envoyer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
