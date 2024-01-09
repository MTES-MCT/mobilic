import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import { formatTimeOfDay, formatTimer, now } from "common/utils/time";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import { AugmentedTable } from "./AugmentedTable";
import { MissionInfoCard } from "./MissionInfoCard";
import { ACTIVITIES } from "common/utils/activities";
import Button from "@mui/material/Button";
import { useActivitiesCardStyles } from "./styles/ActivitiesCardStyle";
import SvgIcon from "@mui/material/SvgIcon";
import EditIcon from "@mui/icons-material/Edit";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ADD_ACTIVITY_IN_MISSION_PANEL,
  EDIT_ACTIVITY_IN_MISSION_PANEL
} from "common/utils/matomoTags";

export function ActivitiesCard({
  missionDeleted = false,
  activities,
  onCreateActivity,
  onEditActivity,
  day,
  title,
  loading,
  fromTime,
  untilTime,
  datetimeFormatter = formatTimeOfDay
}) {
  const classes = useActivitiesCardStyles();
  const ref = React.useRef();
  const { trackEvent } = useMatomo();

  // Augmented Table needs its rows to have unique id
  const activitiesWithIds = activities.map(a => ({
    ...a,
    id: a.id || `${a.type}${a.startTime}`
  }));

  const activityColumns = [
    {
      label: "Activité",
      name: "type",
      format: type => ACTIVITIES[type].label,
      maxWidth: 185,
      minWidth: 150
    },
    {
      label: "Début",
      name: "displayedStartTime",
      format: time => datetimeFormatter(time),
      minWidth: 130
    },
    {
      label: "Fin",
      name: "displayedEndTime",
      format: time =>
        time ? (
          datetimeFormatter(time)
        ) : missionDeleted ? (
          "-"
        ) : (
          <span className={classes.warningText}>En cours</span>
        ),
      minWidth: 130
    },
    {
      label: "Durée",
      name: "duration",
      align: "right",
      format: (duration, entry) =>
        missionDeleted && !entry.displayedEndTime
          ? "-"
          : formatTimer(
              (entry.displayedEndTime || now()) - entry.displayedStartTime
            ),
      minWidth: 60
    }
  ];

  const editPictoCol = {
    label: "",
    name: "id",
    format: (id, entry) => (
      <SvgIcon
        cursor={"pointer"}
        color={"primary"}
        viewBox="0 0 24 24"
        component={EditIcon}
        onClick={e => {
          e.stopPropagation();
          trackEvent(EDIT_ACTIVITY_IN_MISSION_PANEL);
          onEditActivity(entry);
        }}
      />
    ),
    sortable: false,
    align: "center",
    overflowTooltip: true
  };
  if (onEditActivity) {
    activityColumns.push(editPictoCol);
  }

  const AddActivityButton = () => (
    <Button
      aria-label="Ajouter une activité"
      color="primary"
      size="small"
      className={classes.addActivityButton}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        trackEvent(ADD_ACTIVITY_IN_MISSION_PANEL);
        onCreateActivity();
      }}
    >
      Ajouter une activité
    </Button>
  );

  return (
    <MissionInfoCard title={title} extraPaddingBelowTitle loading={loading}>
      <Grid container key={2} spacing={2}>
        <Grid item xs={12}>
          <Grid key={1} item xs={12} className={classes.listActivitiesGrid}>
            {onCreateActivity && <AddActivityButton />}
            <AugmentedTable
              columns={activityColumns}
              ref={ref}
              validateRow={entry => entry.type}
              entries={activitiesWithIds}
              className={classes.activitiesTableContainer}
            />
          </Grid>
        </Grid>
        {activities.length > 0 &&
          !missionDeleted && [
            <Grid
              key={1}
              item
              xs={12}
              sm={4}
              className={classes.chartContainer}
            >
              <Typography variant="h6">Frise temporelle</Typography>
              <VerticalTimeline
                width={300}
                activities={activities}
                datetimeFormatter={datetimeFormatter}
              />
            </Grid>,
            <Grid
              key={2}
              item
              xs={12}
              sm={8}
              className={classes.chartContainer}
            >
              <Typography variant="h6">Répartition</Typography>
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
