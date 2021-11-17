import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import { formatTimeOfDay, formatTimer, now } from "common/utils/time";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import { AugmentedTable } from "./AugmentedTable";
import { MissionInfoCard } from "./MissionInfoCard";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { ACTIVITIES } from "common/utils/activities";
import TextField from "@material-ui/core/TextField/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import { DateOrDateTimePicker } from "../../pwa/components/DateOrDateTimePicker";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles(theme => ({
  listActivitiesAccordion: {
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
      borderBottom: 0
    },
    "&:before": {
      display: "none"
    }
  },
  listActivitiesAccordionSummary: {
    backgroundColor: "rgba(0, 0, 0, .03)",
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
      transform: "rotate(90deg)"
    },
    "& .MuiAccordionSummary-content": {
      marginLeft: theme.spacing(1)
    }
  },
  listActivitiesAccordionDetail: {
    display: "block",
    overflowX: "auto",
    padding: theme.spacing(2),
    borderTop: "1px solid rgba(0, 0, 0, .125)"
  },
  activitiesTableContainer: {
    width: "100%"
  },
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  noActivitiesText: {
    color: theme.palette.grey[500],
    fontStyle: "italic"
  },
  chartContainer: {
    textAlign: "center"
  },
  addActivityButton: {
    float: "right"
  }
}));

export function ActivitiesCard({
  activities,
  onCreateActivity,
  onEditActivity,
  onDeleteActivity,
  day,
  title,
  loading,
  fromTime,
  untilTime,
  datetimeFormatter = formatTimeOfDay
}) {
  const classes = useStyles();
  const ref = React.useRef();

  const activitiesWithIds = activities.map(a => ({
    ...a,
    id: a.id || `${a.type}${a.startTime}`
  }));
  const [activityErrors, setActivityErrors] = React.useState({});

  const activityColumns = [
    {
      label: "Activité",
      name: "type",
      create: true,
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
      edit: true,
      minWidth: 210
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
      edit: true,
      minWidth: 210
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

  return (
    <MissionInfoCard title={title} extraPaddingBelowTitle loading={loading}>
      <Grid container key={2} spacing={2}>
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
        <Grid item xs={12}>
          <Accordion
            elevation={0}
            className={classes.listActivitiesAccordion}
            defaultExpanded={activities.length === 0}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className={classes.listActivitiesAccordionSummary}
            >
              <Typography className="bold">Liste des activités</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.listActivitiesAccordionDetail}>
              {onCreateActivity && (
                <Button
                  aria-label="Ajouter une activité"
                  color="primary"
                  size="small"
                  className={classes.addActivityButton}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    ref.current.newRow({
                      displayedStartTime:
                        activities[activities.length - 1]?.endTime || day,
                      displayedEndTime:
                        activities[activities.length - 1]?.endTime || day
                    });
                  }}
                >
                  Ajouter une activité
                </Button>
              )}
              <AugmentedTable
                columns={activityColumns}
                ref={ref}
                onRowAdd={onCreateActivity}
                onRowEdit={onEditActivity}
                onRowDelete={onDeleteActivity}
                validateRow={entry =>
                  !activityErrors.displayedStartTime &&
                  !activityErrors.displayedEndTime &&
                  entry.type
                }
                entries={activitiesWithIds}
                className={classes.activitiesTableContainer}
              />
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </MissionInfoCard>
  );
}
