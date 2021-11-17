import React from "react";
import { AugmentedTable } from "./AugmentedTable";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import Grid from "@material-ui/core/Grid";
import { isWidthUp } from "@material-ui/core/withWidth";
import Box from "@material-ui/core/Box";
import { useApi } from "common/utils/api";
import { USER_WORK_DAY_QUERY } from "common/utils/apiQueries";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useStyles } from "./styles/WorkTimeDetailsStyle";
import {
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
import { DayRegulationInfo } from "../../common/DayRegulationInfo";
import Skeleton from "@material-ui/lab/Skeleton";
import { MetricCard } from "../../common/InfoCard";
import { MissionInfoCard } from "./MissionInfoCard";
import { ExpendituresCard } from "./ExpendituresCard";
import { ActivitiesCard } from "./ActivitiesCard";

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
    <Grid container key={2} spacing={3} direction="column" wrap="nowrap">
      <Grid item container spacing={2} justify="space-between">
        <Grid
          item
          sm={4}
          container
          spacing={2}
          direction="column"
          wrap="nowrap"
        >
          <Grid item className={classes.cardRecapKPIContainer}>
            <MetricCard
              loading={loading}
              className={`${classes.cardRecapKPI}`}
              center
              py={2}
              variant="outlined"
              titleProps={{ variant: "h3" }}
              title="Amplitude"
              value={formatTimer(workTimeEntry.service)}
              valueProps={{
                className: classes.amplitudeText,
                variant: "body1"
              }}
              subText={`de ${formatTimeOfDay(workTimeEntry.startTime)} à
                ${formatTimeOfDay(workTimeEntry.endTime)}`}
            />
          </Grid>
          <Grid item className={classes.cardRecapKPIContainer}>
            <MetricCard
              className={classes.cardRecapKPI}
              loading={loading}
              center
              py={2}
              variant="outlined"
              titleProps={{ variant: "h3" }}
              title="Temps de travail"
              value={formatTimer(workTimeEntry.totalWork)}
              valueProps={{
                className: classes.amplitudeText,
                variant: "body1"
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={8}>
          <MissionInfoCard
            title="Seuils réglementaires"
            loading={loading}
            className={classes.regulatoryAlertCard}
          >
            <DayRegulationInfo
              activitiesOverCurrentPastAndNextDay={activitiesOver3Days}
              weekActivities={weekActivities}
              dayStart={workTimeEntry.periodStart}
            />
          </MissionInfoCard>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <ExpendituresCard
          title="Frais de la journée"
          loading={loading}
          expenditures={workTimeEntry.expenditures}
        />
      </Grid>
      <Grid item xs={12}>
        <ActivitiesCard
          activities={dayActivities}
          title="Activités de la journée"
          loading={loading}
          fromTime={workTimeEntry.periodStart}
          untilTime={periodEnd.getTime() / 1000}
        />
      </Grid>
      <Grid item xs={12}>
        <MissionInfoCard title="Missions de la journée" extraPaddingBelowTitle>
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
        </MissionInfoCard>
      </Grid>
    </Grid>
  ];
}
