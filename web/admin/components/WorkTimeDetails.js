import React from "react";
import { EXPENDITURES } from "common/utils/expenditures";
import { AugmentedTable } from "./AugmentedTable";
import Drawer from "@material-ui/core/Drawer/Drawer";
import { isWidthUp } from "@material-ui/core/withWidth";
import Box from "@material-ui/core/Box";
import { useApi } from "common/utils/api";
import { USER_WORK_DAY_QUERY } from "common/utils/apiQueries";
import { useLoadingScreen } from "common/utils/loading";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { useStyles } from "./styles/WorkTimeDetailsStyle";
import { Card, Grid } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import { VerticalTimeline } from "common/components/VerticalTimeline";
import { ActivitiesPieChart } from "common/components/ActivitiesPieChart";
import {
  addBreakToActivityList,
  computeDurationAndTime
} from "common/utils/activities";
import { MissionDetails } from "./MissionDetails";
import SvgIcon from "@material-ui/core/SvgIcon";
import { ChevronRight } from "@material-ui/icons";
import {
  DAY,
  formatTimeOfDay,
  formatTimer,
  prettyFormatDay
} from "common/utils/time";

export function WorkTimeDetails({ workTimeEntry, handleClose, width }) {
  const classes = useStyles();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const [activities, setActivities] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [missionDrawerOpen, setMissionDrawerOpen] = React.useState(false);
  const [missionIdOnFocus, setMissionIdOnFocus] = React.useState(null);

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
    withLoadingScreen(async () => {
      const apiResponse = await api.graphQlQuery(USER_WORK_DAY_QUERY, {
        activityAfter: workTimeEntry.periodActualStart,
        activityBefore: workTimeEntry.periodActualEnd,
        userId: workTimeEntry.user.id
      });
      console.log("apiResponse", apiResponse);
      const allActivities = apiResponse.data.user.activities.edges.map(
        nodeAct => nodeAct.node
      );
      const allMissions = apiResponse.data.user.missions.edges.map(
        nodeMission => nodeMission.node
      );
      // Add breaks
      const activitiesWithBreaks = addBreakToActivityList(allActivities);
      // Compute duration and end time for each activity
      const augmentedAndSortedActivities = computeDurationAndTime(
        activitiesWithBreaks,
        workTimeEntry.periodStart,
        periodEnd.getTime() / 1000
      );

      setActivities(augmentedAndSortedActivities);
      setMissions(missionsToTableEntries(allMissions));
    });
  }, [workTimeEntry]);

  return [
    <Box key={0} className={classes.missionTitleContainer}>
      <Typography variant="h3" className={classes.missionTitle}>
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
      <Grid item xs={4}>
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
      <Grid item xs={8}>
        <Card className={classes.cardLegalThreshold} variant="outlined">
          Alertes règlementaires
        </Card>
      </Grid>
    </Grid>,
    <Card key={3} className={classes.cardExpenditures} variant="outlined">
      <Typography variant="h3" className={classes.expendituresTitle}>
        Frais de la journée
      </Typography>
      <Box className={`flex-row`}>
        {hasExpenditure
          ? Object.keys(workTimeEntry.expenditures).map(exp => {
              const expProps = EXPENDITURES[exp];
              const expCount = workTimeEntry.expenditures[exp];
              const label =
                expCount > 1
                  ? `${expCount} ${expProps.plural}`
                  : expProps.label;
              return (
                expCount > 0 && (
                  <Chip
                    key={exp.type}
                    className={classes.chipExpenditure}
                    label={label}
                  />
                )
              );
            })
          : "Aucun Frais n'a été enregistré pour cette journée"}
      </Box>
    </Card>,
    <Card key={4} className={classes.cardExpenditures} variant="outlined">
      <Typography variant="h3" className={classes.activitiesTitle}>
        Activités de la journée
      </Typography>
      {activities.length > 0 && (
        <Grid
          container
          key={2}
          spacing={2}
          className={classes.workTimeRecapCards}
        >
          <Grid item xs={4}>
            <Typography variant="h6">Frise temporelle</Typography>
            <VerticalTimeline
              width={300}
              activities={activities}
              datetimeFormatter={formatTimeOfDay}
            />
          </Grid>
          <Grid item xs={8}>
            <Typography variant="h6">Répartition</Typography>
            <ActivitiesPieChart
              activities={activities}
              fromTime={workTimeEntry.periodStart}
              untilTime={periodEnd.getTime() / 1000}
              maxWidth={500}
            />
          </Grid>
        </Grid>
      )}
    </Card>,
    <Card key={5} className={classes.cardExpenditures} variant="outlined">
      <Drawer
        anchor="right"
        open={!!missionDrawerOpen}
        onClose={() => setMissionDrawerOpen(false)}
        PaperProps={{
          className: classes.missionDrawer,
          style: {
            minWidth: isWidthUp("sm", width) ? 800 : "100vw",
            maxWidth: isWidthUp("md", width) ? 750 : "100vw"
          }
        }}
      >
        <MissionDetails
          width={width}
          missionId={missionIdOnFocus}
          handleClose={() => setMissionDrawerOpen(false)}
        />
      </Drawer>
      <Typography variant="h3" className={classes.activitiesTitle}>
        Missions de la journée
      </Typography>
      {missions.length > 0 && (
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
