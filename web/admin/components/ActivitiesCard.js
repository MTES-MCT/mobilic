import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import { formatTimeOfDay, formatTimer, now } from "common/utils/time";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import { AugmentedTable } from "./AugmentedTable";
import { MissionInfoCard } from "./MissionInfoCard";
import { ACTIVITIES } from "common/utils/activities";
import TextField from "@material-ui/core/TextField/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import { DateOrDateTimePicker } from "../../pwa/components/DateOrDateTimePicker";
import Button from "@material-ui/core/Button";
import { useActivitiesCardStyles } from "./styles/ActivitiesCardStyle";
import SvgIcon from "@material-ui/core/SvgIcon";
import EditIcon from "@material-ui/icons/Edit";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ADD_ACTIVITY_IN_MISSION_PANEL,
  EDIT_ACTIVITY_IN_MISSION_PANEL
} from "common/utils/matomoTags";

export function ActivitiesCard({
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
  const [activityErrors, setActivityErrors] = React.useState({});

  const activityColumns = [
    {
      label: "Activité",
      name: "type",
      format: type => ACTIVITIES[type].label,
      renderEditMode: (type, entry, setType) => (
        <TextField
          label="Activité"
          required
          fullWidth
          select
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {Object.keys(ACTIVITIES).map(activityName => (
            <MenuItem key={activityName} value={activityName}>
              {ACTIVITIES[activityName].label}
            </MenuItem>
          ))}
        </TextField>
      ),
      maxWidth: 185,
      minWidth: 150
    },
    {
      label: "Début",
      name: "displayedStartTime",
      format: time => datetimeFormatter(time),
      renderEditMode: (time, entry, setTime) => (
        <DateOrDateTimePicker
          label="Début"
          format={
            datetimeFormatter === formatTimeOfDay ? "HH:mm" : "dd/MM HH:mm"
          }
          autoValidate
          error={activityErrors.displayedStartTime}
          maxValue={now()}
          setError={e =>
            setActivityErrors({ ...activityErrors, displayedStartTime: e })
          }
          value={time}
          setValue={setTime}
          required={true}
        />
      ),
      minWidth: 130
    },
    {
      label: "Fin",
      name: "displayedEndTime",
      format: time =>
        time ? (
          datetimeFormatter(time)
        ) : (
          <span className={classes.warningText}>En cours</span>
        ),
      renderEditMode: (time, entry, setTime) => (
        <DateOrDateTimePicker
          label="Fin"
          value={time}
          minValue={entry.displayedStartTime + 1}
          autoValidate
          maxValue={now()}
          setValue={setTime}
          error={activityErrors.displayedEndTime}
          setError={e =>
            setActivityErrors({ ...activityErrors, displayedEndTime: e })
          }
          required={true}
          format={
            datetimeFormatter === formatTimeOfDay ? "HH:mm" : "dd/MM HH:mm"
          }
        />
      ),
      minWidth: 130
    },
    {
      label: "Durée",
      name: "duration",
      align: "right",
      format: (duration, entry) =>
        formatTimer(
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
              validateRow={entry =>
                !activityErrors.displayedStartTime &&
                !activityErrors.displayedEndTime &&
                entry.type
              }
              entries={activitiesWithIds}
              className={classes.activitiesTableContainer}
            />
          </Grid>
        </Grid>
        {activities.length > 0 && [
          <Grid key={1} item xs={12} sm={4} className={classes.chartContainer}>
            <Typography variant="h6">Frise temporelle</Typography>
            <VerticalTimeline
              width={300}
              activities={activities}
              datetimeFormatter={datetimeFormatter}
            />
          </Grid>,
          <Grid key={2} item xs={12} sm={8} className={classes.chartContainer}>
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
