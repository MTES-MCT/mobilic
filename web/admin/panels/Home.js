import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import {
  DASHBOARD_HOME_QUERY,
  ADMIN_QUERY_USER_WORK_DAY
} from "common/utils/apiQueries/admin";
import { SEND_INVITATIONS_REMINDERS } from "common/utils/apiQueries/employments";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { DAYS, MONTHS } from "common/utils/time";
import { PRETTY_LABELS } from "./RegulatoryRespect/RegulatoryRespectAlertsRecap";
import { useDayDrawer } from "../drawers/DayDrawer";
import { aggregateWorkDayPeriods } from "../utils/workDays";

const MOBILIC_BLUE = "#3965EA";

function formatFullDate(dateStr) {
  const d = new Date(dateStr);
  const dayName = DAYS[d.getDay()];
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function filterDaysThisWeek(days) {
  if (!days || days.length === 0) return [];
  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return days.filter((d) => {
    const date = new Date(d);
    return date >= startOfWeek && date < endOfWeek;
  });
}

function KpiCard({ title, count, buttonLabel, onButtonClick }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 250,
        border: "1px solid #DDDDDD",
        borderBottom: `4px solid ${MOBILIC_BLUE}`,
        borderRadius: "4px",
        p: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 180
      }}
    >
      <Typography
        sx={{
          color: "#3A3A3A",
          fontSize: "0.875rem"
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: "#161616",
          fontSize: "2rem",
          fontWeight: 700,
          my: 1
        }}
      >
        {count}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button priority="secondary" size="small" onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      </Box>
    </Box>
  );
}

function ClickableLine({ count, label, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        border: "1px solid #DDDDDD",
        borderRadius: "4px",
        py: 2,
        px: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "#F6F6F6" }
      }}
    >
      <Typography>
        <Box
          component="span"
          sx={{
            color: "#000091",
            fontWeight: 700,
            fontSize: "1.25rem",
            mr: 1
          }}
        >
          {count}
        </Box>
        {label}
      </Typography>
      <Box
        component="span"
        className="fr-icon-arrow-right-line"
        sx={{ color: "#000091" }}
      />
    </Box>
  );
}

function AlertRow({ label, count, dayDetails, onClickDay, isLast, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
          px: 2,
          cursor: "pointer",
          borderTop: "1px solid #DDDDDD",
          borderBottom: !expanded && isLast ? "1px solid #DDDDDD" : "none",
          backgroundColor: expanded ? "#f4f8ff" : "transparent",
          "&:hover": { backgroundColor: expanded ? "#f4f8ff" : "#F6F6F6" }
        }}
      >
        <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              borderRadius: "4px",
              backgroundColor: "#FFE9E6",
              color: "#B34000",
              fontSize: "0.75rem",
              fontWeight: 700,
              lineHeight: "20px",
              px: 0.75,
              textTransform: "uppercase"
            }}
          >
            {count}
          </Box>
          <Box
            component="span"
            className={
              expanded
                ? "fr-icon-arrow-up-s-line"
                : "fr-icon-arrow-down-s-line"
            }
            sx={{ color: "#161616", fontSize: "1rem" }}
          />
        </Stack>
      </Box>
      {expanded && (
        <Stack
          sx={{
            px: 2,
            pt: 2,
            pb: 3,
            borderTop: "1px solid #DDDDDD",
            borderBottom: isLast ? "1px solid #DDDDDD" : "none"
          }}
          spacing={0.5}
        >
          {dayDetails.map((detail, i) => (
            <Box
              key={`${detail.day}-${detail.userName}-${i}`}
              component="button"
              onClick={() => onClickDay(detail.day, detail.userId)}
              sx={{
                color: "#000091",
                fontSize: "0.875rem",
                textDecoration: "underline",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                textAlign: "left",
                fontFamily: "inherit",
                "&:hover": { textDecoration: "none" }
              }}
            >
              {formatFullDate(detail.day)} – {detail.userName}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function InfractionsSection({ alertsData, onClickDay }) {
  const history = useHistory();
  const allAlerts = [
    ...(alertsData?.dailyAlerts || []),
    ...(alertsData?.weeklyAlerts || [])
  ];

  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const weeklyAlerts = allAlerts
    .filter((a) => a.alertsType in PRETTY_LABELS)
    .map((a) => {
      const weekDays = filterDaysThisWeek(a.days);
      const weekDetails = (a.dayDetails || []).filter((d) => {
        const date = new Date(d.day);
        return date >= startOfWeek && date < endOfWeek;
      });
      return { ...a, weekDays, weekCount: weekDays.length, weekDetails };
    })
    .filter((a) => a.weekCount > 0);

  const hasAlerts = weeklyAlerts.length > 0;

  return (
    <Box>
      {hasAlerts ? (
        <Box>
          {weeklyAlerts.map((alert, index) => (
            <AlertRow
              key={alert.alertsType}
              label={PRETTY_LABELS[alert.alertsType]}
              count={alert.weekCount}
              dayDetails={alert.weekDetails}
              onClickDay={onClickDay}
              isLast={index === weeklyAlerts.length - 1}
            />
          ))}
        </Box>
      ) : (
        <Typography sx={{ color: "#3A3A3A", fontStyle: "italic" }}>
          Tous les seuils réglementaires sont respectés
        </Typography>
      )}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Box
          component="a"
          onClick={(e) => {
            e.preventDefault();
            history.push("/admin/regulatory-respect");
          }}
          href="/admin/regulatory-respect"
          sx={{
            color: "#000091",
            fontSize: "0.875rem",
            textDecoration: "underline",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": { textDecoration: "none" }
          }}
        >
          Voir le respect des seuils
          <Box
            component="span"
            className="fr-icon-arrow-right-line fr-icon--sm"
            aria-hidden="true"
          />
        </Box>
      </Box>
    </Box>
  );
}

export default function Home({ setShouldRefreshData }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const history = useHistory();
  const alerts = useSnackbarAlerts();
  const { openWorkday } = useDayDrawer();

  const [summary, setSummary] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sendingReminders, setSendingReminders] = useState(false);

  const hasDataRef = React.useRef(false);

  const fetchDashboard = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const now = new Date();
        const month = now.toISOString().slice(0, 7);
        const res = await api.graphQlQuery(
          DASHBOARD_HOME_QUERY,
          {
            id: adminStore.userId,
            companyIds: [adminStore.companyId],
            month
          },
          { fetchPolicy: forceRefresh ? "network-only" : "cache-first" }
        );
        const company = res.data.user.adminedCompanies[0];
        setSummary(company.dashboardSummary);
        setAlertsData(company.regulatoryAlertsRecap);
        setLastUpdate(now);
        hasDataRef.current = true;
      } catch (err) {
        console.error("Dashboard load failed:", err);
        alerts.error("Erreur lors du chargement du tableau de bord", "", 6000);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api, adminStore.userId, adminStore.companyId, alerts]
  );

  const refreshDashboard = useCallback(
    () => fetchDashboard(true),
    [fetchDashboard]
  );

  useEffect(() => {
    if (adminStore.userId && adminStore.companyId) {
      fetchDashboard();
    }
  }, [adminStore.userId, adminStore.companyId, fetchDashboard]);

  async function handleSendReminders() {
    if (!summary?.pendingInvitationEmploymentIds?.length) return;
    try {
      setSendingReminders(true);
      const res = await api.graphQlMutate(SEND_INVITATIONS_REMINDERS, {
        employmentIds: summary.pendingInvitationEmploymentIds
      });
      const sentCount =
        res.data.employments.sendInvitationsReminders.sentToEmploymentIds
          .length;
      alerts.success(`${sentCount} relance(s) envoyée(s)`, "", 6000);
      if (setShouldRefreshData) setShouldRefreshData(true);
    } catch (err) {
      console.error("Send reminders failed:", err);
      alerts.error("Erreur lors de la relance", "", 6000);
    } finally {
      setSendingReminders(false);
    }
  }

  async function handleClickDay(day, userId) {
    try {
      const resPayload = await api.graphQlQuery(
        ADMIN_QUERY_USER_WORK_DAY,
        {
          adminId: adminStore.userId,
          day,
          userId,
          companyId: adminStore.companyId
        },
        { fetchPolicy: "cache-first" }
      );
      const edges =
        resPayload.data.user.adminedCompanies[0].workDays.edges;
      if (!edges || edges.length === 0) {
        alerts.error("Aucune donnée de journée trouvée pour ce salarié", "", 6000);
        return;
      }
      const aggregates = aggregateWorkDayPeriods(
        edges.map((e) => e.node),
        "day"
      );
      if (aggregates.length > 0) {
        openWorkday(aggregates[0]);
      }
    } catch (err) {
      console.error("Day detail load failed:", err);
      alerts.error("Erreur lors du chargement de la journée", "", 6000);
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) return null;

  const formattedUpdate = lastUpdate
    ? `le ${String(lastUpdate.getDate()).padStart(2, "0")}/${String(lastUpdate.getMonth() + 1).padStart(2, "0")} à ${String(lastUpdate.getHours()).padStart(2, "0")}:${String(lastUpdate.getMinutes()).padStart(2, "0")}`
    : "";

  return (
    <Box sx={{ px: 5, py: 3 }}>
      <Typography
        sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#161616", mb: 3 }}
      >
        Bienvenue sur Mobilic !
      </Typography>

      <Box
        sx={{
          opacity: refreshing ? 0.5 : 1,
          transition: "opacity 0.2s ease",
          pointerEvents: refreshing ? "none" : "auto"
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
            columnGap: 7
          }}
        >
          {/* Row 1, Col 1: invitation banner — inline layout for baseline propagation */}
          <Box sx={{ mb: 3, alignSelf: "baseline" }}>
            {summary.pendingInvitationsCount > 0 && (
              <>
                <Typography component="span" sx={{ color: "#3A3A3A" }}>
                  {summary.pendingInvitationsCount} invitation(s) de salariés
                  sont toujours en attente.
                </Typography>
                <Button
                  priority="secondary"
                  size="small"
                  onClick={handleSendReminders}
                  disabled={sendingReminders}
                  style={{ marginLeft: 16, verticalAlign: "baseline" }}
                >
                  {sendingReminders ? "Envoi en cours..." : "Relancer"}
                </Button>
              </>
            )}
          </Box>

          {/* Row 1, Col 2: infractions title */}
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#161616",
              mb: 3,
              alignSelf: "baseline"
            }}
          >
            Infractions cette semaine
          </Typography>

          {/* Row 2, Col 1: today section */}
          <Box sx={{ alignSelf: "start" }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
                Aujourd'hui
              </Typography>
              {lastUpdate && (
                <Typography sx={{ color: "#666666", fontSize: "0.875rem" }}>
                  Dernière mise à jour {formattedUpdate}
                </Typography>
              )}
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  verticalAlign: "baseline",
                  animation: refreshing
                    ? "spin 1s linear infinite"
                    : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" }
                  }
                }}
              >
                <Button
                  iconId="fr-icon-refresh-line"
                  title="Rafraîchir"
                  priority="tertiary no outline"
                  size="small"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                />
              </Box>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 3 }}>
              <KpiCard
                title="Mission(s) en cours"
                count={summary.activeMissionsCount}
                buttonLabel="Suivre l'activité"
                onButtonClick={() => history.push("/admin/activities")}
              />
              <KpiCard
                title="Mission(s) à valider"
                count={summary.pendingValidationsCount}
                buttonLabel="Valider les saisies"
                onButtonClick={() => history.push("/admin/validations")}
              />
            </Stack>

            <Stack spacing={2}>
              <ClickableLine
                count={summary.inactiveEmployeesCount}
                label="salariés n'ont pas lancé Mobilic"
                onClick={() =>
                  history.push({
                    pathname: "/admin/activities",
                    state: { openInactiveDropdown: true }
                  })
                }
              />
              <ClickableLine
                count={summary.autoValidatedMissionsCount}
                label="missions validées automatiquement"
                onClick={() =>
                  history.push({
                    pathname: "/admin/validations",
                    state: { tab: 2 }
                  })
                }
              />
            </Stack>
          </Box>

          {/* Row 2, Col 2: alerts */}
          <Box sx={{ alignSelf: "start" }}>
            <InfractionsSection alertsData={alertsData} onClickDay={handleClickDay} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
