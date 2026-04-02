import React from "react";
import {
  formatTimer,
  getStartOfWeek,
  prettyFormatMonth,
  textualPrettyFormatDay,
  textualPrettyFormatWeek
} from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import { makeStyles } from "@mui/styles";
import { MissionNamesList } from "./MissionNamesList";
import { useMissionDrawer } from "../drawers/MissionDrawer";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { useDayDrawer } from "../drawers/DayDrawer";
import { useAdminStore } from "../store/store";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { OPEN_WORKDAY_DRAWER } from "common/utils/matomoTags";
import { AugmentedTable } from "./AugmentedTable";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import {
  entryDeleted,
  entryToBeValidatedByAdmin,
  entryToBeValidatedByWorker,
  missionToValidationEntries
} from "../selectors/validationEntriesSelectors";
import { RunningTag, ToValidateTag, ValidatedTag, WaitingTag, DeletedTag, AllValidatedTag } from "../drawers/Tags";
import { MISSION_STATUS } from "../utils/missionsStatus";
import { MissionStatusTagBtn } from "./MissionStatusTagBtn";

const useStyles = makeStyles((theme) => ({
  expenditures: {
    padding: theme.spacing(4)
  },
  workTimeModal: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4)
  }
}));

const InfractionsWaiting = () => (
  <Tooltip title="Mission(s) en attente de validation">
    <span
      className={cx("fr-icon--sm", "fr-icon-time-line")}
      style={{ color: "var(--background-flat-blue-france)" }}
    />
  </Tooltip>
);

const InfractionsNumber = ({ nbAlerts }) => (
  <Badge severity={nbAlerts ? "warning" : "success"} noIcon>
    {nbAlerts}
  </Badge>
);

const formatInfractions = (_, entry) => {
  if (!entry.totalWork) {
    return null;
  }
  // if regulationComputation is null, it means worker has more recent missions in the same day for which infractions are being computed, so we don't display anything to avoid confusion
  if (entry.regulationComputations === null) {
    return null
  }
  if (entry.regulationComputations === undefined) {
    return <InfractionsWaiting />;
  }
  return (
    <InfractionsNumber
      nbAlerts={entry.regulationComputations.nbAlertsDailyAdmin}
    />
  );
};

const formatDailyInfractions = (_, entry) => {
  if (!entry.totalWork) {
    return null;
  }
  return <InfractionsNumber nbAlerts={entry.dailyAlerts} />;
};

const formatWeeklyInfractions = (_, entry) => {
  if (!entry.totalWork) {
    return null;
  }
  return <InfractionsNumber nbAlerts={entry.weeklyAlerts} />;
};

const formatStatus = (status) => status || null;

const formatMissionNamesList = (_, entry, openMission) => {
  if (!entry.missionNames || !entry.status) {
    return null;
  }

  const missionNames = entry.missionNames;
  const missionsStatus =
    entry.status.props.text || entry.status.props.children?.props.text;
  const missionsAreClickable =
    missionsStatus !== MISSION_STATUS.allValidated;

  return (
    <MissionNamesList
      missionNames={missionNames}
      openMission={missionsAreClickable ? openMission : null}
    />
  );
};

const getStatusForEntry = (
  entry,
  missionsById,
  currentUserId,
  openMission
) => {
  if (!entry || !missionsById || !currentUserId || !openMission) {
    return null;
  }

  // 1. Get all missions associated to the entry

  // Get missions ids from entry
  const missionsIds = Object.keys(entry.missionNames);
  // Get missions from ids
  const missions = missionsIds.map(id => missionsById[id])

  // 2.If missions found, determine status
  if (missions.length === 0)
    return null;

  const validationEntries = missions
    .flatMap((mission) => missionToValidationEntries(mission))

    // Mission is ongoing ?
  if (validationEntries.some((val) => !val.endTime)) {
    return (
      <MissionStatusTagBtn missionId={validationEntries[0].missionId} openMission={openMission}>
        <RunningTag text={MISSION_STATUS.ongoing} />
      </MissionStatusTagBtn>
    );
  }

  // Mission is waiting validation from admin ?
  const isWaitingAdminValidation = validationEntries.some((val) => entryToBeValidatedByAdmin(val, currentUserId))
  if (isWaitingAdminValidation) {
    return (
      <MissionStatusTagBtn missionId={validationEntries[0].missionId} openMission={openMission}>
        <ToValidateTag text={MISSION_STATUS.toValidateAdmin} printIcon={false} />
      </MissionStatusTagBtn>
    );
  }

  // Missions is waiting validation from worker ?
  const isWaitingWorkerValidation = validationEntries.some((val) => entryToBeValidatedByWorker(val))
  if (isWaitingWorkerValidation) {
    return (
      <MissionStatusTagBtn missionId={validationEntries[0].missionId} openMission={openMission}>
        <WaitingTag text={MISSION_STATUS.waitingWorker} />
      </MissionStatusTagBtn>
    );
  }

  // Mission is validated ?
  const areSomeMissionsValidated = validationEntries.some((val) => val.adminValidation)
  if (areSomeMissionsValidated) {
    return (
      <MissionStatusTagBtn missionId={validationEntries[0].missionId} openMission={openMission}>
        <ValidatedTag text={MISSION_STATUS.validated} />
      </MissionStatusTagBtn>
    );
  }

  if (validationEntries.some((val) => entryDeleted(val))) {
    return <DeletedTag text={MISSION_STATUS.deleted} />
  }

  return null;
}

const getMostRecentMissionId = (entry, missionsById, nbMissions) => {
  let mostRecentMissionId = 0
  let missionStartTime = null;

  for (let i = 0; i < nbMissions; i++) {
    const missionId = Object.keys(entry.missionNames)[i];
    const mission = missionsById[missionId];
    
    if (!mission || !mission.startTime)
      return null

    if (missionStartTime === null || Number(mission.startTime) > Number(missionStartTime)) {
      mostRecentMissionId = missionId;
      missionStartTime = mission.startTime;
      continue
    }
  }
  return mostRecentMissionId;
}

const onRowClick = (entry, trackEvent, openWorkday, openMission) => {
  if (!entry.day || trackEvent === null || openWorkday === null || openMission === null) {
    return false;
  }

  trackEvent(OPEN_WORKDAY_DRAWER);

  if (entry.status.props.text !== MISSION_STATUS.allValidated) {
    openMission(Object.keys(entry.missionNames)[0]);
    return true;
  }

  openWorkday(entry);
  return true;
}

export function WorkTimeTable({
  period,
  workTimeEntries,
  missionsById,
  className,
  showMissionName,
  showExpenditures,
  loading
}) {
  const { openWorkday } = useDayDrawer();
  const openMission = useMissionDrawer()[1];
  const adminStore = useAdminStore();

  const { trackEvent } = useMatomo();

  const classes = useStyles();

  let periodLabel, periodFormatter;
  if (period === "day") {
    periodLabel = "Date";
    periodFormatter = textualPrettyFormatDay;
  } else if (period === "week") {
    periodLabel = "Semaine";
    periodFormatter = (ts) => textualPrettyFormatWeek(getStartOfWeek(ts));
  } else if (period === "month") {
    periodLabel = "Mois";
    periodFormatter = prettyFormatMonth;
  }
  const employeeCol = {
    label: "Salarié",
    name: "workerName",
    sortable: true,
    align: "left",
    overflowTooltip: true
  };
  const infractionsCol = {
    label: "Infractions",
    name: "infractions",
    minWidth: 120,
    format: formatInfractions,
    align: "center",
    flexGrow: 0
  };
  const dailyInfractionsCol = {
    label: "Infractions journalières",
    name: "dailyInfractions",
    minWidth: 120,
    format: formatDailyInfractions,
    align: "center"
  };
  const weeklyInfractionsCol = {
    label: "Infractions hebdomadaires",
    name: "weeklyInfractions",
    minWidth: 140,
    format: formatWeeklyInfractions,
    align: "center"
  };
  const workTimeCol = {
    label: "Travail",
    name: "totalWork",
    sortable: true,
    format: formatTimer,
    align: "center",
    minWidth: 120,
    flexGrow: 0
  };
  const restTimeCol = {
    label: "Pause",
    name: "workDuration",
    format: (time) => (time ? formatTimer(time, false) : '0min'),
    align: "center",
    minWidth: 100,
    flexGrow: 0
  };
  const amplitudeCol = {
    label: "Amplitude",
    name: "service",
    format: (time) => (time ? formatTimer(time, false) : null),
    align: "center",
    minWidth: 100,
    flexGrow: 0
  };
  const statusCol = {
    label: "Statut",
    name: "status",
    format: formatStatus,
    align: "left",
    minWidth: 120
  };
  const expenditureCol = {
    label: "Frais",
    name: "expenditureAggs",
    format: (exps) => (exps ? formatExpendituresAsOneString(exps) : null),
    align: "left",
    minWidth: 200,
    overflowTooltip: true,
    className: classes.expenditures
  };
  const workedDaysCol = {
    label: "Jours travaillés",
    name: "workedDays",
    minWidth: 150
  };
  const missionNamesCol = {
    label: "Mission(s)",
    name: "missionNames",
    format: (_, entry) => formatMissionNamesList(_, entry, openMission),
    align: "left",
    sortable: true,
    overflowTooltip: true
  };

  let columns = [];
  if (period === "day") {
    columns = [
      employeeCol,
      showMissionName && missionNamesCol,
      infractionsCol,
      workTimeCol,
      restTimeCol,
      amplitudeCol,
      statusCol,
    ];
  } else {
    columns = [
      employeeCol,
      dailyInfractionsCol,
      weeklyInfractionsCol,
      workTimeCol,
      workedDaysCol,
      showExpenditures && expenditureCol
    ];
  }

  columns = columns.filter(Boolean);

  const preFormattedWorkTimeEntries = []

  workTimeEntries.map((wte) => {
    const nbMissions = wte.missionNames ? Object.keys(wte.missionNames).length : 0;
    
    // We get the most recentMission Id
    let mostRecentMissionId = getMostRecentMissionId(wte, missionsById, nbMissions);
    
    const missionsStatus = [...new Set(Object.keys(wte.missionNames || {}).map(missionId => {
      const mission = missionsById[missionId];
      if (!mission) return null;
      return getStatusForEntry(
        {
          missionNames: { [missionId]: wte.missionNames[missionId] },
          user: wte.user,
          endTime: mission.endTime
        },
        missionsById,
        adminStore.userId,
        openMission
      )
    }))]
    const areAllMissionsValidated = missionsStatus.every(status => status && status.props.children.props.text === MISSION_STATUS.validated)
    if (areAllMissionsValidated) {
        const rest = wte.rest || null;
        const service = wte.service || null;
        const totalWork = wte.totalWork || null;
        const regulationComputations = wte.regulationComputations || null;

        const base = {
          ...wte,
          rest,
          service,
          totalWork,
          regulationComputations,
          id: wte.user.id + wte.periodStart.toString(),
          workerName: formatPersonName(wte.user),
          status: <AllValidatedTag text={MISSION_STATUS.allValidated} />,
          selectable: true,
        };
        preFormattedWorkTimeEntries.push(base);
        return
    } else {
      for (let i = 0; i < nbMissions; i++) {

        const missionId = Object.keys(wte.missionNames)[i];
        const mission = missionsById[missionId];
        if (!mission) 
          continue;
        const rest = missionsById[missionId].userStats[wte.user.id] ? missionsById[missionId].userStats[wte.user.id].breakDuration : null;
        const service = missionsById[missionId].userStats[wte.user.id] ? missionsById[missionId].userStats[wte.user.id].service : null;
        const totalWork = missionsById[missionId].userStats[wte.user.id] ? missionsById[missionId].userStats[wte.user.id].totalWorkDuration : null;
        let regulationComputations = null

        if (missionId === mostRecentMissionId) {
          regulationComputations = wte.regulationComputations
        }
        
        const base = {
          ...wte,
          missionNames: { [missionId]: wte.missionNames[missionId] },
          rest,
          service,
          totalWork,
          regulationComputations,
          id: wte.user.id + wte.periodStart.toString() + missionId,
          workerName: formatPersonName(wte.user),
          status: getStatusForEntry(
            {
              missionNames: { [missionId]: mission.name },
              user: wte.user,
              endTime: mission.endTime
            },
            missionsById,
            adminStore.userId,
            openMission
          ),
          selectable: true,
        };
        preFormattedWorkTimeEntries.push(base);
      }
    }
  });

  return (
    <>
      <AugmentedTable
        key={2}
        columns={columns}
        entries={preFormattedWorkTimeEntries}
        small
        virtualizedRowHeight={40}
        defaultSortBy="periodStart"
        defaultSortType="desc"
        className={className}
        virtualized
        onRowClick={(entry) =>
          onRowClick(entry, trackEvent, openWorkday, openMission)
        }
        groupByColumn={{
          label: periodLabel,
          name: "periodStart",
          sort: "desc",
          height: 60,
          format: periodFormatter,
          minWidth: period === "month" ? 120 : 80,
          overflowTooltip: true
        }}
        loading={loading}
      />
    </>
  );
}
