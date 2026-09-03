import React from "react";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import { useToggleContradictory } from "./history/toggleContradictory";
import Skeleton from "@mui/material/Skeleton";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Event } from "../../common/Event";
import { MISSION_RESOURCE_TYPES, isSplitEvent } from "common/utils/contradictory";
import { getChangeIconAndText, getEventAuthorName } from "../../common/logEvent";
import { now, formatDateTimeLiteral } from "common/utils/time";
import { ACTIVITIES, getActivityLabelDependingOnMissionType } from "common/utils/activities";
import { isConnectionError } from "common/utils/errors";
import { Accordion, AccordionDetails } from "@mui/material";
import AccordionSummary from "@mui/material/AccordionSummary";

export const useStyles = makeStyles(theme => ({
  noChangesText: {
    marginTop: theme.spacing(1),
    color: theme.palette.grey[600],
    fontStyle: "italic",
    marginBottom: theme.spacing(1)
  },
  missionEvent: {
    backgroundColor: theme.palette.primary.main
  },
  updateActivityEvent: {
    backgroundColor: theme.palette.warning.main
  },
  validationEvent: {
    backgroundColor: theme.palette.success.main
  },
  arrow: {
    marginBottom: theme.spacing(-1)
  },
  collapse: {
    display: "block",
    background: "inherit",
    padding: 0
  },
  accordion: {
    "&::before": {
      content: "none"
    },
    "&.Mui-disabled": {
      background: "inherit"
    },
    background: "inherit"
  },
  accordionTitle: {
    padding: 0
  },
  disputeEvent: {
    backgroundColor: fr.colors.decisions.background.flat.warning.default,
    "& .fr-icon-warning-fill": {
      marginTop: -2
    }
  }
}));

export function ContradictoryChanges({
  mission,
  validationTime,
  showEventsBeforeValidation = true,
  userId,
  cacheInStore,
  controlId = null,
  titleProps = {}
}) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  const contradictoryInfo = useToggleContradictory(
    true,
    open,
    setOpen,
    [[mission, validationTime || now()]],
    cacheInStore,
    controlId
  );

  const iconClassName = (event, color = null) => {
    if (event.type !== "CREATE") {
      return classes.updateActivityEvent;
    }
    if (
      event.resourceType === MISSION_RESOURCE_TYPES.validation ||
      event.resourceType === MISSION_RESOURCE_TYPES.autoValidationAdmin ||
      event.resourceType === MISSION_RESOURCE_TYPES.autoValidationEmployee
    ) {
      return classes.validationEvent;
    }
    if (event.after?.context?.splitFrom) {
      return classes.updateActivityEvent;
    }
    return classes.missionEvent;
  };

  const changesHistory = contradictoryInfo.eventsHistory;
  const loadingEmployeeVersion = contradictoryInfo.isComputingContradictory;
  const contradictoryComputationError =
    contradictoryInfo.contradictoryComputationError;

  const disputeEvents = React.useMemo(() => {
    const historyActivities = mission.resourcesWithHistory?.resources
      ?.filter(r => r.type === MISSION_RESOURCE_TYPES.activity)
      ?.map(r => r.resource) || [];
    const storeActivities = mission.allActivities || mission.activities || [];
    const historyIds = new Set(historyActivities.map(a => a.id));
    const activities = [
      ...historyActivities,
      ...storeActivities.filter(a => !historyIds.has(a.id))
    ];
    return activities
      .filter(a => a.dispute?.status === "created" && a.userId === userId)
      .map(a => {
        const hasRevisions = a.versions?.length > 1;
        const isSplit = a.versions?.some(v => v.context?.splitFrom);
        let disputedAction = "l'ajout";
        if (a.dismissedAt) disputedAction = "la suppression";
        else if (hasRevisions || isSplit) disputedAction = "la modification";
        return {
          type: "DISPUTE",
          resourceType: MISSION_RESOURCE_TYPES.activity,
          resourceId: a.id,
          time: a.dispute.time,
          submitter: null,
          submitterId: a.dispute.submitter_id,
          userId: a.userId,
          before: a,
          after: null,
          _disputeText: a.dispute.text,
          _activityType: a.type,
          _disputedAction: disputedAction
        };
      });
  }, [mission.allActivities, mission.activities, mission.resourcesWithHistory, userId]);

  const userChangesHistory = [
    ...changesHistory.filter(
      c =>
        (c.userId === userId || !c.userId) &&
        (showEventsBeforeValidation || c.time >= (validationTime || now()))
    ),
    ...disputeEvents
  ].sort((a, b) => a.time - b.time);
  return (
    <Accordion
      elevation={0}
      className={classes.accordion}
      expanded={open || contradictoryComputationError}
      disabled={contradictoryComputationError}
      onChange={
        contradictoryComputationError
          ? null
          : (e, newValue) => setOpen(newValue)
      }
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        className={classes.accordionTitle}
      >
        <Typography className="bold" {...titleProps}>
          Historique de saisie
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.collapse}>
        {loadingEmployeeVersion ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : contradictoryComputationError ? (
          <Typography className={classes.noChangesText}>
            {isConnectionError(contradictoryComputationError)
              ? "Les données ne sont pas disponibles pour le moment car il n'y a pas de connexion Internet"
              : `Données non disponibles pour le moment`}
          </Typography>
        ) : (
          <>
            <List dense>
              {userChangesHistory.map(userChange => {
                if (userChange.type === "DISPUTE") {
                  const activityLabel = getActivityLabelDependingOnMissionType(
                    userChange._activityType
                  );
                  const action = userChange._disputedAction || "la modification";
                  const text = `a contesté ${action} de l'activité ${activityLabel} (motif : "${userChange._disputeText}")`;
                  return (
                    <Event
                      key={`dispute-${userChange.resourceId}`}
                      icon={<span className="fr-icon-warning-fill" aria-hidden="true" />}
                      iconClassName={classes.disputeEvent}
                      iconBackgroundColor={fr.colors.decisions.background.flat.warning.default}
                      text={text}
                      submitterId={userChange.submitterId}
                      time={userChange.time}
                      withFullDate={true}
                    />
                  );
                }
                const changes = getChangeIconAndText(userChange);
                const isSplit = isSplitEvent(userChange);
                const context = userChange.type === "DELETE"
                  ? userChange.before?.dismissContext
                  : userChange.after?.context;
                const motif = isSplit ? null : (context?.comment || context?.userComment);
                return changes.map(({ icon, text: rawText, color }) => {
                  let text = rawText;
                  if (userChange.resourceType === MISSION_RESOURCE_TYPES.activity) {
                    const data = userChange.after || userChange.before;
                    const label = ACTIVITIES[data?.type]?.label;
                    if (label) {
                      if (userChange.type === "DELETE") {
                        text = `a supprimé l'activité ${label} démarrée le ${formatDateTimeLiteral(userChange.before.startTime)}`;
                      } else if (userChange.type === "CREATE" && data.endTime && !isSplit) {
                        text = `a ajouté l'activité ${label} du ${formatDateTimeLiteral(data.startTime)} au ${formatDateTimeLiteral(data.endTime)}`;
                      }
                    }
                  }
                  if (motif) text = `${text} (motif : "${motif}")`;
                  return (
                  <Event
                    key={`${(userChange.after || userChange.before).id}${text}`}
                    icon={icon}
                    iconClassName={iconClassName(userChange)}
                    text={text}
                    authorName={getEventAuthorName(userChange)}
                    submitter={userChange.submitter}
                    submitterId={userChange.submitterId}
                    time={userChange.time}
                    withFullDate={true}
                    iconBackgroundColor={color}
                    isAutomatic={
                      userChange.resourceType ===
                        MISSION_RESOURCE_TYPES.autoValidationAdmin ||
                      userChange.resourceType ===
                        MISSION_RESOURCE_TYPES.autoValidationEmployee
                    }
                  />
                  );
                });
              })}
            </List>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
