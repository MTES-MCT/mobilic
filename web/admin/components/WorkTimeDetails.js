import React from "react";
import { EXPENDITURES } from "common/utils/expenditures";
import { AugmentedTable } from "./AugmentedTable";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import { isWidthUp } from "@material-ui/core/withWidth";
import Box from "@material-ui/core/Box";
import { useApi } from "common/utils/api";
import { USER_WORK_DAY_QUERY } from "common/utils/apiQueries";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useStyles } from "./styles/WorkTimeDetailsStyle";
import Chip from "@material-ui/core/Chip";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import {
  ACTIVITIES,
  addBreaksToActivityList,
  computeDurationAndTime,
  filterActivitiesOverlappingPeriod
} from "common/utils/activities";
import { MissionDetails } from "./MissionDetails";
import SvgIcon from "@material-ui/core/SvgIcon";
import { ChevronRight } from "@material-ui/icons";
import {
  DAY,
  formatTimeOfDay,
  formatTimer,
  getStartOfWeek,
  now,
  prettyFormatDay,
  WEEK
} from "common/utils/time";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { DayRegulationInfo } from "../../common/DayRegulationInfo";
import Skeleton from "@material-ui/lab/Skeleton";
import Accordion from "@material-ui/core/Accordion";

export function WorkTimeDetails({ workTimeEntry, handleClose, width }) {
  const classes = useStyles();
  const api = useApi();
  const [dayActivities, setDayActivities] = React.useState([]);
  const [weekActivities, setWeekActivities] = React.useState([]);
  const [activitiesOver3Days, setActivitiesOver3Days] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [missionDrawerOpen, setMissionDrawerOpen] = React.useState(false);
  const [missionIdOnFocus, setMissionIdOnFocus] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const periodEnd = new Date(workTimeEntry.periodStart * 1000 + DAY * 1000);

  const nameMissionCol = {
    label: "Nom",
    name: "name",
    sortable: true,
    align: "left",
    overflowTooltip: true
  };

  const startLocationMissionCol = {
    label: "Départ",
    name: "startLocationName",
    sortable: true,
    align: "left",
    overflowTooltip: true
  };

  const endLocationMissionCol = {
    label: "Arrivée",
    name: "endLocationName",
    sortable: true,
    align: "left",
    overflowTooltip: true
  };

  const pictoCol = {
    label: "+ d'infos",
    name: "id",
    format: () => <SvgIcon viewBox="0 0 24 24" component={ChevronRight} />,
    sortable: false,
    align: "center",
    overflowTooltip: true
  };

  const listActivitiesCol = [
    {
      label: "Activité",
      name: "type",
      format: (type, entry) => ACTIVITIES[type].label,
      maxWidth: 185,
      minWidth: 150
    },
    {
      label: "Début",
      name: "displayedStartTime",
      format: (time, entry) => formatTimeOfDay(time),
      minWidth: 210
    },
    {
      label: "Fin",
      name: "displayedEndTime",
      format: (time, entry) =>
        time ? (
          formatTimeOfDay(time)
        ) : (
          <span className={classes.warningText}>
            <strong>En cours</strong>
          </span>
        ),
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

  const periodActualEnd = workTimeEntry.periodActualEnd || now();

  const showMissionName = missions.some(mission => mission.name);
  const missionTableColumns = showMissionName ? [nameMissionCol] : [];
  missionTableColumns.push(
    startLocationMissionCol,
    endLocationMissionCol,
    pictoCol
  );

  const missionsToTableEntries = missions =>
    missions.map(m => ({
      ...m,
      startLocationName: m.startLocation?.name,
      endLocationName: m.endLocation?.name
    }));

  const hasExpenditure = !!Object.values(
    workTimeEntry.expenditures || {}
  )?.find(expCount => expCount > 0);

  React.useEffect(() => {
    setLoading(true);
    (async () => {
      const apiResponse = await api.graphQlQuery(USER_WORK_DAY_QUERY, {
        activityAfter: Math.min(
          getStartOfWeek(workTimeEntry.periodActualStart),
          workTimeEntry.periodActualStart - DAY
        ),
        activityBefore: Math.max(
          getStartOfWeek(periodActualEnd) + WEEK,
          periodActualEnd + DAY
        ),
        missionAfter: workTimeEntry.periodActualStart,
        missionBefore: periodActualEnd,
        userId: workTimeEntry.user.id
      });
      const allActivities = apiResponse.data.user.activities.edges.map(
        nodeAct => nodeAct.node
      );
      const allMissions = apiResponse.data.user.missions.edges.map(
        nodeMission => nodeMission.node
      );
      const activitiesOfDay = filterActivitiesOverlappingPeriod(
        allActivities,
        workTimeEntry.periodActualStart,
        periodActualEnd
      );

      // Add breaks
      const activitiesWithBreaks = addBreaksToActivityList(activitiesOfDay);
      // Compute duration and end time for each activity
      const augmentedAndSortedActivities = computeDurationAndTime(
        activitiesWithBreaks,
        workTimeEntry.periodStart,
        periodEnd.getTime() / 1000
      );

      setWeekActivities(
        filterActivitiesOverlappingPeriod(
          allActivities,
          getStartOfWeek(workTimeEntry.periodActualStart),
          getStartOfWeek(periodActualEnd) + WEEK
        )
      );

      setActivitiesOver3Days(
        filterActivitiesOverlappingPeriod(
          allActivities,
          workTimeEntry.periodActualStart - DAY,
          periodActualEnd + DAY
        )
      );

      setDayActivities(augmentedAndSortedActivities);
      setMissions(missionsToTableEntries(allMissions));
      setLoading(false);
    })();
  }, [workTimeEntry]);

  return [
    <Box key={0} className={classes.workTimeDetailsTitleContainer}>
      <Typography variant="h3" className={classes.workTimeDetailsTitle}>
        Détail de la journée du{" "}
        {prettyFormatDay(workTimeEntry.periodActualStart, true)}
      </Typography>
      <IconButton
        aria-label="Fermer"
        className={classes.closeButton}
        onClick={handleClose}
      >
        <CloseIcon />
      </IconButton>
    </Box>,
    <Box key={1}>
      <Typography variant="h3" className={classes.employeeName}>
        {workTimeEntry.workerName}
      </Typography>
    </Box>,
    <Grid container key={2} spacing={2} className={classes.workTimeRecapCards}>
      <Grid item xs={12} sm={4}>
        <Card
          className={`${classes.cardRecapKPI} ${classes.cardRecapAmplitude}`}
          variant="outlined"
        >
          <Typography variant="h3">Amplitude</Typography>
          <Typography className={classes.amplitudeText}>
            {formatTimer(workTimeEntry.service)}
          </Typography>
          <Typography>
            {`de ${formatTimeOfDay(workTimeEntry.startTime)} à
            ${formatTimeOfDay(workTimeEntry.endTime)}`}
          </Typography>
        </Card>
        <Card className={classes.cardRecapKPI} variant="outlined">
          <Typography variant="h3">Temps de travail</Typography>
          <Typography className={classes.amplitudeText}>
            {formatTimer(workTimeEntry.totalWork)}
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Card className={classes.cardLegalThreshold} variant="outlined">
          <Typography variant="h3" className={classes.legalInfoTitle}>
            Seuils réglementaires
          </Typography>
          <DayRegulationInfo
            activitiesOverCurrentPastAndNextDay={activitiesOver3Days}
            weekActivities={weekActivities}
            dayStart={workTimeEntry.periodStart}
          />
        </Card>
      </Grid>
    </Grid>,
    <Card key={3} className={classes.cardExpenditures} variant="outlined">
      <Typography variant="h3" className={classes.expendituresTitle}>
        Frais de la journée
      </Typography>
      <Box className={`flex-row`}>
        {hasExpenditure ? (
          Object.keys(workTimeEntry.expenditures).map(exp => {
            const expProps = EXPENDITURES[exp];
            const expCount = workTimeEntry.expenditures[exp];
            const label =
              expCount > 1 ? `${expCount} ${expProps.plural}` : expProps.label;
            return (
              expCount > 0 && (
                <Chip
                  key={exp}
                  className={classes.chipExpenditure}
                  label={label}
                />
              )
            );
          })
        ) : (
          <Typography className={classes.noExpenditureLabel}>
            Aucun frais n'a été enregistré pour cette journée
          </Typography>
        )}
      </Box>
    </Card>,
    <Card key={4} className={classes.cardExpenditures} variant="outlined">
      <Typography variant="h3" className={classes.activitiesTitle}>
        Activités de la journée
      </Typography>
      {loading && <Skeleton variant={"rect"} width="100%" height={300} />}
      {dayActivities.length > 0 && !loading && (
        <Grid
          container
          key={2}
          spacing={2}
          className={classes.workTimeRecapCards}
        >
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Frise temporelle</Typography>
            <VerticalTimeline
              width={300}
              activities={dayActivities}
              datetimeFormatter={formatTimeOfDay}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">Répartition</Typography>
            <ActivitiesPieChart
              activities={dayActivities}
              fromTime={workTimeEntry.periodStart}
              untilTime={periodEnd.getTime() / 1000}
              maxWidth={500}
            />
          </Grid>
          <Grid item xs={12}>
            <Accordion
              elevation={0}
              className={classes.listActivitiesAccordion}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className={classes.listActivitiesAccordionSummary}
              >
                <Typography className="bold">Liste des activités</Typography>
              </AccordionSummary>
              <AccordionDetails
                className={classes.listActivitiesAccordionDetail}
              >
                <AugmentedTable
                  columns={listActivitiesCol}
                  entries={dayActivities}
                  className={classes.activitiesTableContainer}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}
    </Card>,
    <Card key={5} className={classes.cardExpenditures} variant="outlined">
      <SwipeableDrawer
        anchor="right"
        open={!!missionDrawerOpen}
        onOpen={() => setMissionDrawerOpen(true)}
        onClose={() => setMissionDrawerOpen(false)}
        PaperProps={{
          className: classes.missionDrawer,
          style: {
            minWidth: isWidthUp("md", width) ? 800 : "100vw",
            maxWidth: isWidthUp("md", width) ? 750 : "100vw"
          }
        }}
      >
        <MissionDetails
          width={width}
          missionId={missionIdOnFocus}
          handleClose={() => setMissionDrawerOpen(false)}
        />
      </SwipeableDrawer>
      <Typography variant="h3" className={classes.activitiesTitle}>
        Missions de la journée
      </Typography>
      {loading && <Skeleton variant={"rect"} width="100%" height={200} />}
      {!loading && missions.length > 0 && (
        <AugmentedTable
          columns={missionTableColumns}
          entries={missions}
          onRowClick={entry => {
            setMissionIdOnFocus(entry.id);
            setMissionDrawerOpen(true);
          }}
        />
      )}
    </Card>
  ];
}
