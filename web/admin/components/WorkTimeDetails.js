import React, { useMemo } from "react";
import { AugmentedTable } from "./AugmentedTable";
import Box from "@mui/material/Box";
import { useApi } from "common/utils/api";
import { useStyles } from "./styles/WorkTimeDetailsStyle";
import {
  addBreaksToActivityList,
  computeDurationAndTime,
  filterActivitiesOverlappingPeriod
} from "common/utils/activities";
import SvgIcon from "@mui/material/SvgIcon";
import { ChevronRight } from "@mui/icons-material";
import {
  DAY,
  formatTimeOfDay,
  formatTimer,
  getStartOfWeek,
  now,
  WEEK
} from "common/utils/time";
import { MetricCard } from "../../common/InfoCard";
import { MissionInfoCard } from "./MissionInfoCard";
import { ExpendituresCard } from "./ExpendituresCard";
import { ActivitiesCard } from "./ActivitiesCard";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { OPEN_MISSION_DRAWER_IN_WORKDAY_PANEL } from "common/utils/matomoTags";
import { USER_WORK_DAY_QUERY } from "common/utils/apiQueries/user";
import { DayDrawerHeader } from "../drawers/DrawerHeader";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export function WorkTimeDetails({ workTimeEntry, handleClose, openMission }) {
  const classes = useStyles();
  const api = useApi();
  const [dayActivities, setDayActivities] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const { trackEvent } = useMatomo();

  const periodEnd = new Date(workTimeEntry.periodStart * 1000 + DAY * 1000);
  const stillRunning = !workTimeEntry.endTime;

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

  const showMissionName = missions.some((mission) => mission.name);
  const missionTableColumns = showMissionName ? [nameMissionCol] : [];
  missionTableColumns.push(
    startLocationMissionCol,
    endLocationMissionCol,
    pictoCol
  );

  const missionsToTableEntries = (missions) =>
    missions.map((m) => ({
      ...m,
      startLocationName: m.startLocation?.name,
      endLocationName: m.endLocation?.name,
      validatedByAdmin: m.validations.filter((v) => v.isAdmin).length > 0
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
        (nodeAct) => nodeAct.node
      );
      const allMissions = apiResponse.data.user.missions.edges.map(
        (nodeMission) => nodeMission.node
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

      setDayActivities(augmentedAndSortedActivities);
      setMissions(missionsToTableEntries(allMissions));
      setLoading(false);
    })();
  }, [workTimeEntry]);

  const atLeastOneMissionNotValidatedByAdmin = useMemo(
    () => missions.filter((m) => !m.validatedByAdmin).length > 0,
    [missions]
  );

  return (
    <>
      <DayDrawerHeader
        onClose={handleClose}
        workerName={workTimeEntry.workerName}
        periodStart={workTimeEntry.periodActualStart}
        userId={workTimeEntry.user.id}
        stillRunning={stillRunning}
        noAdminValidation={atLeastOneMissionNotValidatedByAdmin}
      />
      <Box className={classes.container}>
        <Stack direction="column" rowGap={4}>
          <Typography component="h2" variant="h4" fontSize="1.25rem">
            Déroulé de la journée
          </Typography>
          <Stack direction="row" columnGap={4}>
            <MetricCard
              loading={loading}
              className={`${classes.cardRecapKPI}`}
              textAlign="center"
              py={2}
              variant="outlined"
              titleProps={{ variant: "h6", component: "h2" }}
              title="Amplitude"
              value={formatTimer(workTimeEntry.service)}
              valueProps={{
                className: `${classes.amplitudeText} ${
                  stillRunning ? classes.runningMissionText : ""
                }`,
                variant: "h1",
                component: "p"
              }}
              subText={
                <span>
                  de {formatTimeOfDay(workTimeEntry.startTime)} à{" "}
                  {formatTimeOfDay(workTimeEntry.endTime)}{" "}
                  {stillRunning ? (
                    <span className={classes.runningMissionText}>
                      (en cours)
                    </span>
                  ) : (
                    ""
                  )}
                </span>
              }
            />
            <MetricCard
              className={classes.cardRecapKPI}
              loading={loading}
              textAlign="center"
              py={2}
              variant="outlined"
              titleProps={{ variant: "h6", component: "h2" }}
              title="Temps de travail"
              value={formatTimer(workTimeEntry.totalWork)}
              valueProps={{
                className: `${classes.amplitudeText} ${
                  stillRunning ? classes.runningMissionText : ""
                }`,
                variant: "h1",
                component: "p"
              }}
              subText={
                stillRunning ? (
                  <span className={classes.runningMissionText}>En cours</span>
                ) : (
                  ""
                )
              }
            />
          </Stack>
          <ExpendituresCard
            title="Frais de la journée"
            loading={loading}
            expenditures={workTimeEntry.expenditures}
            titleProps={{ component: "h2", variant: "h6" }}
          />
          <ActivitiesCard
            activities={dayActivities}
            title="Activités de la journée"
            loading={loading}
            fromTime={workTimeEntry.periodStart}
            untilTime={periodEnd.getTime() / 1000}
            titleProps={{
              variant: "h6",
              component: "h2"
            }}
          />
          <MissionInfoCard
            title="Missions de la journée"
            extraPaddingBelowTitle
            titleProps={{ component: "h2", variant: "h6" }}
          >
            {missions.length > 0 && (
              <AugmentedTable
                columns={missionTableColumns}
                entries={missions}
                onRowClick={(entry) => {
                  trackEvent(OPEN_MISSION_DRAWER_IN_WORKDAY_PANEL);
                  openMission(entry.id);
                }}
              />
            )}
          </MissionInfoCard>
        </Stack>
      </Box>
    </>
  );
}
