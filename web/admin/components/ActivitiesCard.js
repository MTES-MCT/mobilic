import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import { formatDay, formatTimeOfDay, formatTimer, now } from "common/utils/time";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import { MissionInfoCard } from "./MissionInfoCard";
import { getActivityLabelDependingOnMissionType } from "common/utils/activities";
import { useActivitiesCardStyles } from "./styles/ActivitiesCardStyle";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ADD_ACTIVITY_IN_MISSION_PANEL,
  EDIT_ACTIVITY_IN_MISSION_PANEL
} from "common/utils/matomoTags";
import { getChangeIconAndText } from "../../common/logEvent";
import { formatPersonName } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import {
  useActivityHistory,
  isRetroactiveCreate
} from "../hooks/useActivityHistory";

const TAG_CONFIG = {
  MODIFICATION: { label: "MODIFICATION", classKey: "tagModification" },
  SUPPRESSION: { label: "SUPPRESSION", classKey: "tagSuppression" },
  AJOUT: { label: "AJOUT", classKey: "tagAjout" }
};

export function ActivitiesCard({
  missionDeleted = false,
  isHoliday = false,
  activities,
  onCreateActivity,
  onEditActivity,
  day,
  title,
  loading,
  fromTime,
  untilTime,
  datetimeFormatter = formatTimeOfDay,
  titleProps = {},
  actionButtonLabel = "",
  onActionButtonClick = null,
  allowSupportActivity = false,
  mission = null,
  cacheContradictoryInfoInStore = null,
  cardClassName = "",
  simplified = false
}) {
  const classes = useActivitiesCardStyles();
  const { trackEvent } = useMatomo();
  const store = useStoreSyncedWithLocalStorage();
  const currentUserInfo = store.userInfo();

  const {
    entriesWithHistory,
    allActivityEvents,
    expandedActivities,
    setExpandedActivities
  } = useActivityHistory({
    activities,
    mission,
    cacheContradictoryInfoInStore
  });

  const showEditColumn = !!(onEditActivity || simplified);
  const colCount = showEditColumn ? 6 : 5;

  function getComment(event) {
    const ctx = event.__virtual
      ? event.context || event.after?.context
      : event.type === "DELETE"
        ? event.before?.dismissContext
        : event.after?.context;
    let comment = ctx?.comment || ctx?.userComment;
    // fallback: find comment from a concurrent event (same user, within 1s)
    if (!comment && !event.__virtual && (isRetroactiveCreate(event) || event.type === "DELETE")) {
      const concurrent = allActivityEvents.find(
        e => e.userId === event.userId && Math.abs(e.time - event.time) <= 1 && (e.after?.context?.comment || e.after?.context?.userComment)
      );
      if (concurrent) {
        comment = concurrent.after.context.comment || concurrent.after.context.userComment;
      }
    }
    return comment;
  }

  function formatMotif(comment) {
    return comment ? ` (motif : "${comment}")` : "";
  }

  function HistoryLine({ author, dateLabel, text }) {
    return (
      <div>
        <span className={classes.historyAuthor}>{author}</span>
        <span className={classes.historyDate}>{` ${dateLabel}`}</span>
        <br />
        <span className={classes.historyText}>{text}</span>
      </div>
    );
  }

  function renderHistoryRow(entry) {
    const event = entry.__event;
    const motif = formatMotif(getComment(event));
    const changes = getChangeIconAndText(event);
    const author = event.__virtual
      ? formatPersonName(currentUserInfo) || "Vous"
      : event.submitter ? formatPersonName(event.submitter) : "Inconnu";
    const dateLabel = event.__virtual
      ? "(non sauvegardé)"
      : `le ${formatDay(event.time, true)} à ${formatTimeOfDay(event.time)}`;

    return (
      <TableRow key={entry.id} className={classes.historyRow}>
        <TableCell colSpan={colCount} className={classes.historySubRow}>
          {changes.map((change, i) => (
            <HistoryLine key={i} author={author} dateLabel={dateLabel} text={`${change.text}${motif}`} />
          ))}
        </TableCell>
      </TableRow>
    );
  }

  function renderActivityRow(entry) {
    const config = entry.__hasModification && entry.__tagType ? TAG_CONFIG[entry.__tagType] : null;
    const isExpanded = expandedActivities[entry.id];
    const toggleExpand = simplified && config
      ? () => setExpandedActivities(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))
      : undefined;
    const rowClass = `${classes.activityRow}${entry.__tagType === "SUPPRESSION" ? ` ${classes.dismissedRow}` : ""}`;

    return (
      <TableRow
        key={entry.id}
        onClick={toggleExpand}
        className={`${rowClass}${toggleExpand ? ` ${classes.clickableRow}` : ""}`}
      >
        <TableCell className={classes.cellType}>
          {getActivityLabelDependingOnMissionType(entry.type, allowSupportActivity)}
        </TableCell>
        <TableCell className={classes.cellTag}>
          {config && (
            <span className={`${classes.tag} ${classes[config.classKey]}`}>{config.label}</span>
          )}
        </TableCell>
        <TableCell className={classes.cellTime}>{datetimeFormatter(entry.displayedStartTime)}</TableCell>
        <TableCell className={classes.cellTime}>
          {entry.displayedEndTime
            ? datetimeFormatter(entry.displayedEndTime)
            : missionDeleted ? "-" : <span className={classes.warningText}>En cours</span>
          }
        </TableCell>
        <TableCell className={classes.cellDuration}>
          <span className={classes.durationCell}>
            <span className="fr-icon--sm fr-icon-time-line" />
            {missionDeleted && !entry.displayedEndTime
              ? "-"
              : formatTimer((entry.displayedEndTime || now()) - entry.displayedStartTime)}
          </span>
        </TableCell>
        {showEditColumn && (
          <TableCell className={classes.cellAction}>
            {simplified && config ? (
              <IconButton
                size="small"
                aria-expanded={isExpanded}
                aria-label="Afficher l'historique"
                onClick={e => {
                  e.stopPropagation();
                  toggleExpand();
                }}
              >
                <KeyboardArrowDownIcon className={`${classes.chevron} ${isExpanded ? classes.chevronExpanded : ""}`} />
              </IconButton>
            ) : simplified || entry.__tagType === "SUPPRESSION" ? null : (
              <IconButton
                className={classes.editButton}
                onClick={e => {
                  e.stopPropagation();
                  trackEvent(EDIT_ACTIVITY_IN_MISSION_PANEL);
                  onEditActivity(entry);
                }}
              >
                <EditIcon className={classes.editButtonIcon} />
              </IconButton>
            )}
          </TableCell>
        )}
      </TableRow>
    );
  }

  return (
    <MissionInfoCard
      className={cardClassName}
      title={title}
      extraPaddingBelowTitle
      loading={loading}
      titleProps={titleProps}
      actionButtonLabel={
        onCreateActivity && !isHoliday ? "Ajouter une activité" : actionButtonLabel
      }
      actionButtonPriority="secondary"
      onActionButtonClick={
        onCreateActivity && !isHoliday
          ? () => { trackEvent(ADD_ACTIVITY_IN_MISSION_PANEL); onCreateActivity(); }
          : onActionButtonClick
      }
    >
      <Grid container key={2} spacing={2}>
        <Grid item xs={12}>
          <Grid key={1} item xs={12} className={classes.listActivitiesGrid}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow className={classes.headerRow}>
                  <TableCell className={classes.cellType}>Activité</TableCell>
                  <TableCell className={classes.cellTag} />
                  <TableCell className={classes.cellTime}>Début</TableCell>
                  <TableCell className={classes.cellTime}>Fin</TableCell>
                  <TableCell className={classes.cellDuration}>Durée</TableCell>
                  {showEditColumn && <TableCell className={classes.cellAction} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {entriesWithHistory.map(entry => {
                  if (entry.__historyEntry) {
                    if (simplified && !expandedActivities[entry.__parentId]) return null;
                    return renderHistoryRow(entry);
                  }
                  return renderActivityRow(entry);
                })}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
        {activities.length > 0 &&
          !missionDeleted && [
            <Grid key={1} item xs={12} sm={4} className={classes.chartContainer}>
              <Typography variant="h6" component="span">Frise temporelle</Typography>
              <VerticalTimeline
                width={300}
                activities={activities}
                datetimeFormatter={datetimeFormatter}
                allowSupportActivity={allowSupportActivity}
              />
            </Grid>,
            <Grid key={2} item xs={12} sm={8} className={classes.chartContainer}>
              <Typography variant="h6" component="span">Répartition</Typography>
              <ActivitiesPieChart
                activities={activities}
                fromTime={fromTime}
                untilTime={untilTime}
                maxWidth={500}
              />
            </Grid>
          ]}
      </Grid>
    </MissionInfoCard>
  );
}
