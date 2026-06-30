import React from "react";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Collapse from "@mui/material/Collapse";
import { getChangeIconAndText } from "../../common/logEvent";
import { formatPersonName } from "common/utils/coworkers";
import { formatDay, formatTimeOfDay } from "common/utils/time";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/store/store";

const BADGE_CONFIG = {
  SUPPRESSION: {
    label: "ACTIVITÉ SUPPRIMÉE",
    disputedSuffix: " CONTESTÉE",
    backgroundColor: fr.colors.decisions.background.alt.grey.default,
    color: fr.colors.decisions.text.mention.grey.default
  },
  MODIFICATION: {
    label: "MODIFICATION",
    disputedSuffix: " CONTESTÉE",
    backgroundColor: "#FEECC2",
    color: "#716043"
  },
  AJOUT: {
    label: "AJOUT",
    disputedSuffix: " CONTESTÉ",
    backgroundColor: fr.colors.decisions.background.contrast.info.default,
    color: fr.colors.decisions.text.default.info.default
  }
};

const useStyles = makeStyles(() => ({
  historyToggleRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    width: "100%",
    boxSizing: "border-box"
  },
  badge: {
    display: "inline-block",
    padding: "0 6px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: "20px",
    textTransform: "uppercase"
  },
  eventItem: {
    padding: "8px 16px",
    gap: 12,
    textAlign: "left"
  },
  eventHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8
  },
  submitterName: {
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "22px",
    color: fr.colors.decisions.text.title.grey.default
  },
  eventDate: {
    fontWeight: 400,
    fontSize: 12,
    lineHeight: "20px",
    color: fr.colors.decisions.text.mention.grey.default
  },
  eventDescription: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "22px",
    color: fr.colors.decisions.text.default.grey.default
  },
  contestButton: {
    marginTop: 8
  },
  disputeBox: {
    background: fr.colors.decisions.background.contrast.warning.default,
    borderRadius: 0,
    padding: "12px 16px 16px",
    margin: "8px 0",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4
  },
  disputeTitle: {
    fontWeight: 700,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.background.flat.warning.default
  },
  disputeMotif: {
    fontWeight: 400,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.background.flat.warning.default
  },
  disputeCancel: {
    color: `${fr.colors.decisions.background.flat.warning.default} !important`,
    fontSize: 14,
    cursor: "pointer"
  }
}));

function computeBadgeType(events) {
  if (events.some(e => e.type === "DELETE")) return "SUPPRESSION";
  if (events.some(e => e.type === "UPDATE")) return "MODIFICATION";
  if (events.some(e => e.type === "CREATE")) return "AJOUT";
  return null;
}

export function ActivityHistorySection({
  activityEvents,
  shouldDisplayInitialEmployeeVersion,
  validationTime,
  activity,
  onDispute,
  onCancelDispute
}) {
  const classes = useStyles();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const [expanded, setExpanded] = React.useState(false);

  const dispute = activity?.dispute;
  const isDisputed = dispute && dispute.status === "created";

  const filteredEvents = React.useMemo(() => {
    return activityEvents.filter(event => {
      if (event.type === "DELETE") return true;
      const isEmployeeAction = event.submitterId === event.userId;
      if (shouldDisplayInitialEmployeeVersion) return isEmployeeAction;
      return !isEmployeeAction && (!validationTime || event.time >= validationTime);
    });
  }, [activityEvents, shouldDisplayInitialEmployeeVersion, validationTime]);

  if (filteredEvents.length === 0) return null;

  const badgeType = computeBadgeType(filteredEvents);
  const badgeConfig = BADGE_CONFIG[badgeType];
  if (!badgeConfig) return null;

  return (
    <>
      <div className={classes.historyToggleRow}>
        <Box
          component="span"
          className={classes.badge}
          sx={{
            backgroundColor: badgeConfig.backgroundColor,
            color: badgeConfig.color
          }}
        >
          {badgeConfig.label}{!shouldDisplayInitialEmployeeVersion && isDisputed ? badgeConfig.disputedSuffix : ""}
        </Box>
        <Button
          size="small"
          priority="tertiary no outline"
          iconId={expanded ? "fr-icon-arrow-up-s-line" : "fr-icon-arrow-down-s-line"}
          iconPosition="right"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? "Masquer l'historique" : "Afficher l'historique"}
        >
          {expanded ? "Masquer" : "Afficher"}
        </Button>
      </div>
      <Collapse in={expanded}>
        <div className={classes.eventItem}>
          {filteredEvents.map((event, eventIndex) => {
            const changes = getChangeIconAndText(event);
            const context = event.after?.context || event.before?.context;
            const motif = context?.comment || context?.userComment;
            return changes.map((change, changeIndex) => (
              <div key={`${eventIndex}-${changeIndex}`}>
                <div className={classes.eventHeader}>
                  <span className={classes.submitterName}>
                    {formatPersonName(event.submitter)}
                  </span>
                  <span className={classes.eventDate}>
                    le {formatDay(event.time, true)} à {formatTimeOfDay(event.time)}
                  </span>
                </div>
                <div className={classes.eventDescription}>
                  {change.text}
                  {motif && ` (motif : "${motif}")`}
                </div>
              </div>
            ));
          })}
          {!shouldDisplayInitialEmployeeVersion && isDisputed && (
            <div className={classes.disputeBox}>
              <div>
                <span className={classes.disputeTitle}>
                  {formatPersonName(store.userInfo())} a contesté :
                </span>
                {" "}
                <span className={classes.disputeMotif}>
                  "{dispute.text}"
                </span>
              </div>
              {onCancelDispute && (
                <a
                  className={`fr-link fr-link--sm ${classes.disputeCancel}`}
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    onCancelDispute(activity.id);
                  }}
                  aria-label="Annuler la contestation"
                >
                  Annuler
                </a>
              )}
            </div>
          )}
          {!shouldDisplayInitialEmployeeVersion && !isDisputed && onDispute && (
            <div className={classes.contestButton}>
              <Button
                size="small"
                priority="secondary"
                aria-label="Contester cette modification"
                onClick={() =>
                  modals.open("dispute", {
                    handleSubmit: text => onDispute(activity.id, text)
                  })
                }
              >
                Contester
              </Button>
            </div>
          )}
        </div>
      </Collapse>
    </>
  );
}
