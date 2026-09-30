import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { fr } from "@codegouvfr/react-dsfr";
import { useApi } from "common/utils/api";
import {
  NOTIFICATION_CAMPAIGNS_QUERY,
  CANCEL_NOTIFICATION_CAMPAIGN_MUTATION
} from "common/utils/apiQueries/notificationCampaign";

const STATUS_CONFIG = {
  DRAFT: { label: "Programmée", severity: "info" },
  SENDING: { label: "Envoi en cours", severity: "warning" },
  SENT: { label: "Envoyée", severity: "success" },
  CANCELLED: { label: "Annulée", severity: "new" },
  FAILED: { label: "Échouée", severity: "error" }
};

const TARGET_LABELS = {
  ALL_USERS: "Tous les utilisateurs",
  ALL_EMPLOYEES: "Tous les salariés",
  ALL_MANAGERS: "Tous les gestionnaires",
  SPECIFIC_EMPLOYEES: "Salariés spécifiques",
  SPECIFIC_MANAGERS: "Gestionnaires spécifiques"
};

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const borderGrey = fr.colors.decisions.border.default.grey.default;
const mentionGrey = fr.colors.decisions.text.mention.grey.default;
const bgAltGrey = fr.colors.decisions.background.alt.grey.default;

const sectionLabelSx = {
  color: mentionGrey,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 1
};

function StatBlock({ label, value, hint }) {
  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor:
          bgAltGrey,
        borderRadius: 1,
        textAlign: "center"
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, marginBottom: 0.5 }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color:
            mentionGrey
        }}
      >
        {label}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{
            color:
              fr.colors.decisions.text.default.grey.default,
            fontSize: "0.7rem",
            display: "block",
            marginTop: 0.5,
            opacity: 0.6
          }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
}

function CampaignDetailDialog({ campaign, open, onClose }) {
  if (!campaign) return null;
  const config = STATUS_CONFIG[campaign.status] || {
    label: campaign.status,
    severity: "info"
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ padding: 0 }}>
        <Box
          sx={{
            padding: 3,
            backgroundColor:
              bgAltGrey,
            borderBottom: `1px solid ${borderGrey}`
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 1.5
            }}
          >
            <Badge severity={config.severity}>
              {config.label}
            </Badge>
            <Typography
              variant="body2"
              sx={{
                color:
                  mentionGrey
              }}
            >
              {formatDate(
                campaign.completedAt ||
                  campaign.scheduledAt ||
                  campaign.creationTime
              )}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              wordBreak: "break-word"
            }}
          >
            {campaign.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color:
                mentionGrey,
              marginTop: 0.5
            }}
          >
            {TARGET_LABELS[campaign.targetType] ||
              campaign.targetType}
          </Typography>
        </Box>
        <Box sx={{ padding: 3 }}>
          <Typography
            variant="body2"
            sx={sectionLabelSx}
          >
            Contenu du message
          </Typography>
          <Typography
            sx={{
              padding: 2,
              border: `1px solid ${borderGrey}`,
              borderRadius: 1,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              marginBottom: 3
            }}
          >
            {campaign.body}
          </Typography>
          {campaign.targetUsers?.length > 0 && (
            <Box sx={{ marginBottom: 3 }}>
              <Typography
                variant="body2"
                sx={sectionLabelSx}
              >
                Utilisateurs ciblés ({campaign.targetUsers.length})
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: "auto"
                }}
              >
                {campaign.targetUsers.map((u, i) => (
                  <Box
                    key={u.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingY: 1,
                      paddingX: 0.5,
                      ...(i > 0 && {
                        borderTop: `1px solid ${borderGrey}`
                      })
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {u.firstName} {u.lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: mentionGrey }}
                    >
                      {u.email}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1.5
            }}
          >
            <StatBlock
              label="Ciblés"
              value={campaign.targetedCount}
              hint="Utilisateurs dans le groupe sélectionné"
            />
            <StatBlock
              label="Notifiés"
              value={campaign.totalRecipients}
              hint="Utilisateurs ayant activé et reçu la notification"
            />
            <StatBlock
              label="Clics"
              value={campaign.clickedCount || 0}
              hint="Utilisateurs ayant cliqué sur la notification"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: 3,
          paddingTop: 0,
          justifyContent: "flex-end"
        }}
      >
        <Button
          priority="secondary"
          size="small"
          onClick={onClose}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function HistoryRow({ campaign, onClick }) {
  const config = STATUS_CONFIG[campaign.status] || {
    label: campaign.status,
    severity: "info"
  };
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onClick(campaign)}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(campaign);
        }
      }}
      sx={{
        display: "grid",
        gridTemplateColumns: "120px 1fr auto auto",
        alignItems: "center",
        gap: 2,
        padding: 2,
        cursor: "pointer",
        borderBottom: `1px solid ${borderGrey}`,
        "&:hover": {
          backgroundColor:
            bgAltGrey
        },
        "&:last-child": {
          borderBottom: "none"
        }
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color:
            mentionGrey
        }}
      >
        {formatDate(
          campaign.completedAt ||
            campaign.scheduledAt ||
            campaign.creationTime
        )}
      </Typography>
      <Typography
        sx={{
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {campaign.title}
      </Typography>
      <Badge severity={config.severity} small>
        {config.label}
      </Badge>
      <Typography
        variant="body2"
        sx={{
          color:
            mentionGrey,
          whiteSpace: "nowrap"
        }}
      >
        {campaign.totalRecipients}/{campaign.targetedCount}
      </Typography>
    </Box>
  );
}

export default function CampaignHistory({ refreshKey }) {
  const api = useApi();
  const [campaigns, setCampaigns] = React.useState([]);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(null);
  const [cancelError, setCancelError] = React.useState(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    React.useState(null);

  const loadCampaigns = React.useCallback(
    async (offset = 0, append = false) => {
      setLoading(true);
      try {
        const response = await api.graphQlQuery(
          NOTIFICATION_CAMPAIGNS_QUERY,
          { offset, limit: 20 },
          { context: { nonPublicApi: true } }
        );
        const page = response.data.notificationCampaigns;
        if (append) {
          setCampaigns(prev => [
            ...prev,
            ...(page.results || [])
          ]);
        } else {
          setCampaigns(page.results || []);
        }
        setHasMore(page.hasMore);
      } catch {
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  React.useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns, refreshKey]);

  const handleCancel = async campaignId => {
    setCancelling(campaignId);
    setCancelError(null);
    try {
      await api.graphQlMutate(
        CANCEL_NOTIFICATION_CAMPAIGN_MUTATION,
        { campaignId },
        { context: { nonPublicApi: true } }
      );
      loadCampaigns();
    } catch {
      setCancelError(campaignId);
    } finally {
      setCancelling(null);
    }
  };

  if (!loading && campaigns.length === 0) {
    return (
      <Typography
        sx={{
          color:
            mentionGrey
        }}
      >
        Aucune campagne pour le moment.
      </Typography>
    );
  }

  const active = campaigns.filter(
    c => c.status === "DRAFT" || c.status === "SENDING"
  );
  const past = campaigns.filter(
    c => c.status !== "DRAFT" && c.status !== "SENDING"
  );

  return (
    <Box>
      {active.length > 0 && (
        <Box sx={{ marginBottom: 3 }}>
          {active.map(c => {
            const isSending = c.status === "SENDING";
            return (
              <Box
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedCampaign(c)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedCampaign(c);
                  }
                }}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "center",
                  gap: 2,
                  padding: 2,
                  marginBottom: 1,
                  border: `1px solid ${borderGrey}`,
                  borderRadius: 1,
                  backgroundColor:
                    bgAltGrey,
                  cursor: "pointer",
                  "&:hover": {
                    borderColor:
                      fr.colors.decisions.text.actionHigh
                        .blueFrance.default
                  }
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {c.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        mentionGrey,
                      marginTop: 0.5
                    }}
                  >
                    {TARGET_LABELS[c.targetType] ||
                      c.targetType}
                    {c.scheduledAt &&
                      ` · Envoi le ${formatDate(c.scheduledAt)}`}
                  </Typography>
                </Box>
                <Badge
                  severity={
                    isSending
                      ? STATUS_CONFIG.SENDING.severity
                      : STATUS_CONFIG.DRAFT.severity
                  }
                >
                  {isSending
                    ? `${c.totalRecipients}/${c.targetedCount}`
                    : STATUS_CONFIG.DRAFT.label}
                </Badge>
                {!isSending && (
                  <Button
                    size="small"
                    priority="tertiary"
                    disabled={cancelling === c.id}
                    onClick={e => {
                      e.stopPropagation();
                      handleCancel(c.id);
                    }}
                  >
                    Annuler
                  </Button>
                )}
                {cancelError === c.id && (
                  <Alert
                    severity="error"
                    title="L'annulation a échoué."
                    small
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
      {past.length > 0 && (
        <Box
          sx={{
            border: `1px solid ${borderGrey}`,
            borderRadius: 1,
            overflow: "hidden"
          }}
        >
          <Box
            role="button"
            tabIndex={0}
            onClick={() => setHistoryOpen(prev => !prev)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHistoryOpen(prev => !prev);
              }
            }}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 2,
              cursor: "pointer",
              "&:hover": {
                backgroundColor:
                  fr.colors.decisions.background.alt.grey
                    .default
              }
            }}
          >
            <Typography sx={{ fontWeight: 600 }}>
              Historique ({past.length} campagne
              {past.length > 1 ? "s" : ""})
            </Typography>
            <span
              className={
                historyOpen
                  ? "fr-icon-arrow-up-s-line"
                  : "fr-icon-arrow-down-s-line"
              }
              aria-hidden="true"
            />
          </Box>
          <Collapse in={historyOpen}>
            <Box
              sx={{
                borderTop: `1px solid ${borderGrey}`
              }}
            >
              {past.map(c => (
                <HistoryRow
                  key={c.id}
                  campaign={c}
                  onClick={setSelectedCampaign}
                />
              ))}
            </Box>
            {hasMore && (
              <Box
                sx={{
                  padding: 2,
                  textAlign: "center",
                  borderTop: `1px solid ${borderGrey}`
                }}
              >
                <Button
                  priority="secondary"
                  size="small"
                  onClick={() =>
                    loadCampaigns(
                      campaigns.length,
                      true
                    )
                  }
                  disabled={loading}
                >
                  {loading
                    ? "Chargement…"
                    : "Charger plus"}
                </Button>
              </Box>
            )}
          </Collapse>
        </Box>
      )}
      <CampaignDetailDialog
        campaign={selectedCampaign}
        open={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </Box>
  );
}
