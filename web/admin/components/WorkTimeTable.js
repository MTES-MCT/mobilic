import React from "react";
import PropTypes from "prop-types";
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
import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { OPEN_WORKDAY_DRAWER } from "common/utils/matomoTags";
import { AugmentedTable } from "./AugmentedTable";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import {
  missionToValidationEntries
} from "../selectors/validationEntriesSelectors";
import { RunningTag, ToValidateTag, ValidatedTag, WaitingTag, DeletedTag, AllValidatedTag } from "../drawers/Tags";
import { MISSION_STATUS, computeMissionStatus } from "../utils/missionsStatus";
import { MissionStatusTagBtn } from "./MissionStatusTagBtn";

// regulatory thresholds : mirrors app/services/get_regulation_checks.py
const WEEKLY_WORK_MAX_BY_BUSINESS = { LONG_DISTANCE: 56, SHORT_DISTANCE: 52 };
const WEEKLY_WORK_MAX_DEFAULT = 48;
const WEEKLY_REST_MIN = 34 * 3600;
const MAX_WORKED_DAYS = 6;
const THRESHOLD_MARGIN = 4 * 3600;

function getWeeklyWorkMax(business) {
  const maxH = WEEKLY_WORK_MAX_BY_BUSINESS[business?.businessType] || WEEKLY_WORK_MAX_DEFAULT;
  return maxH * 3600;
}

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

function getThresholdLevel(value, { min, warnAt, errorAt }) {
  if (min) {
    if (value < errorAt) return "error";
    if (value <= warnAt) return "warning";
  } else {
    if (value >= errorAt) return "error";
    if (value >= warnAt) return "warning";
  }
  return null;
}

function getThresholds(weeklyWorkMax) {
  const maxH = weeklyWorkMax / 3600;
  return {
    work: {
      warnAt: weeklyWorkMax - THRESHOLD_MARGIN,
      errorAt: weeklyWorkMax,
      warnTooltip: `Approche de la durée maximale hebdomadaire (${maxH}h)`,
      errorTooltip: `Durée maximale hebdomadaire dépassée (${maxH}h)`
    },
    rest: {
      min: true,
      warnAt: WEEKLY_REST_MIN + THRESHOLD_MARGIN,
      errorAt: WEEKLY_REST_MIN,
      warnTooltip: "Approche du repos hebdomadaire minimum (34 h)",
      errorTooltip: "Repos hebdomadaire minimum non respecté (34 h)"
    },
    workedDays: {
      warnAt: MAX_WORKED_DAYS,
      errorAt: MAX_WORKED_DAYS + 1,
      warnTooltip: "Le dimanche doit rester entièrement non travaillé",
      errorTooltip: "Aucun jour de repos complet sur la semaine civile"
    }
  };
}

const ThresholdValue = ({ value, formatted, thresholdKey, thresholds }) => {
  const config = thresholds[thresholdKey];
  const level = getThresholdLevel(value, config);
  if (!level) return formatted;
  const isError = level === "error";
  const color = isError
    ? fr.colors.decisions.background.flat.error.default
    : fr.colors.decisions.text.default.warning.default;
  const icon = isError ? "fr-icon-error-line" : "fr-icon-error-warning-line";
  const tooltip = isError ? config.errorTooltip : config.warnTooltip;
  return (
    <Tooltip title={tooltip}>
      <span style={{ color }}>
        <span className={cx("fr-icon--sm", icon)} aria-hidden="true" />{" "}
        {formatted}
      </span>
    </Tooltip>
  );
};

const InfractionsWaiting = ({ tooltipTitle }) => (
  <Tooltip title={tooltipTitle}>
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
  const missionStatus = entry.statusKey ? entry.statusKey : null;
  const isValidatedMissionStatus =
    missionStatus === MISSION_STATUS.validated;

  if (!entry.totalWork) {
    return null;
  }
  // if worker has more recent missions in the same day for which infractions are being computed, so we don't display anything to avoid confusion
  if (entry.hasHiddenInfractionsBecauseNewerMissionExists) {
    return null;
  }
  // If a user has multiple missions on the same day and not all of them are validated,
  // we display the "waiting validation" icon to make it clear that infractions are
  // hidden because some missions are still unvalidated, not because there are none.
  if (!entry.regulationComputations  || isValidatedMissionStatus) {
    const tooltipTitle = isValidatedMissionStatus
      ? "Autre(s) mission(s) en attente de validation"
      : "Mission(s) en attente de validation";
    return <InfractionsWaiting tooltipTitle={tooltipTitle} />;
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

const formatStatus = (status, entry, openMission, openWorkday) => {
  let tag = null;

  if (!status || !entry || !openMission) {
    return null;
  }
  const missionId = Object.keys(entry.missionNames)[0]

  switch (status) {
    case MISSION_STATUS.ongoing:
      tag = <RunningTag/>;
      break;
    case MISSION_STATUS.toValidateAdmin:
      tag = <ToValidateTag printIcon={false} />;
      break;
    case MISSION_STATUS.waitingWorker:
      tag = <WaitingTag/>;
      break;
    case MISSION_STATUS.validated:
      tag = <ValidatedTag/>;
      break;
    case MISSION_STATUS.allValidated:
      tag = <AllValidatedTag/>;
      break;
    case MISSION_STATUS.deleted:
      tag = <DeletedTag/>;
      break;
  }
  return (
    <MissionStatusTagBtn
      missionId={missionId}
      openWorkDay={
        status === MISSION_STATUS.allValidated
          ? () => openWorkday(entry)
          : null
      }
      openMission={status === MISSION_STATUS.allValidated ? null : openMission}
    >
      {tag}
    </MissionStatusTagBtn>
  );
};

const formatMissionNamesList = (_, entry, openMission) => {
  if (!entry.missionNames || !entry.statusKey || !openMission) {
    return null;
  }

  const missionNames = entry.missionNames;
  const missionsStatus = entry.statusKey;
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
  if (
    !entry ||
    !missionsById ||
    currentUserId === null ||
    currentUserId === undefined ||
    !openMission
  ) {
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

  const validationEntries = missions.flatMap((mission) =>
    missionToValidationEntries(mission)
  );

  return computeMissionStatus(validationEntries, currentUserId);
};

const getMostRecentMissionId = (entry, missionsById, missionIds) => {
  let mostRecentMissionId = 0;
  let missionStartTime = null;

  for (const missionId of missionIds) {
    const missionStart = missionsById[missionId]?.startTime;

    if (!missionStart) {
      return null;
    }

    if (
      missionStartTime === null ||
      Number(missionStart) > Number(missionStartTime)
    ) {
      mostRecentMissionId = missionId;
      missionStartTime = missionStart;
    }
  }

  return mostRecentMissionId;
};

const getMissionStatuses = (wte, missionsById, currentUserId, openMission) =>
      Object.keys(wte.missionNames || {}).map((missionId) => {
        const mission = missionsById[missionId];

        if (!mission) {
          return null;
        }

        return getStatusForEntry(
          {
            missionNames: { [missionId]: wte.missionNames[missionId] },
            user: wte.user,
            endTime: mission.endTime
          },
          missionsById,
          currentUserId,
          openMission
        );
      })

const buildAllValidatedEntry = (wte) => ({
  ...wte,
  rest: wte.rest || null,
  service: wte.service || null,
  totalWork: wte.totalWork || null,
  regulationComputations: wte.regulationComputations || null,
  id: wte.user.id + wte.periodStart.toString(),
  workerName: formatPersonName(wte.user),
  statusKey: MISSION_STATUS.allValidated,
  selectable: true
});

const buildMissionEntry = (
  wte,
  missionId,
  missionsById,
  currentUserId,
  openMission,
  mostRecentMissionId
) => {
  const mission = missionsById[missionId];

  if (!mission) {
    return null;
  }

  const userStats = mission.userStats?.[wte.user.id];

  return {
    ...wte,
    missionNames: { [missionId]: wte.missionNames[missionId] },
    rest: userStats ? userStats.breakDuration : null,
    service: userStats ? userStats.service : null,
    totalWork: userStats ? userStats.totalWorkDuration : null,
    regulationComputations:
      missionId === mostRecentMissionId ? wte.regulationComputations : null,
    hasHiddenInfractionsBecauseNewerMissionExists: missionId !== mostRecentMissionId,
    id: wte.user.id + wte.periodStart.toString() + missionId,
    workerName: formatPersonName(wte.user),
    statusKey: getStatusForEntry(
      {
        missionNames: { [missionId]: mission.name },
        user: wte.user,
        endTime: mission.endTime
      },
      missionsById,
      currentUserId,
      openMission
    ),
    selectable: true
  };
};

const preFormatWorkTimeEntries = (
  workTimeEntries,
  missionsById,
  currentUserId,
  openMission,
  period
) => {
  // Mission-level rows only make sense for the day view; week/month entries are already aggregated per employee.
  if (period !== "day") {
    return workTimeEntries.map((wte) => ({
      ...wte,
      id: wte.user.id + wte.periodStart.toString(),
      workerName: formatPersonName(wte.user),
      selectable: true
    }));
  }

  return workTimeEntries.flatMap((wte) => {
    const missionIds = Object.keys(wte.missionNames || {});
    const mostRecentMissionId = getMostRecentMissionId(
      wte,
      missionsById,
      missionIds
    );
    const missionsStatus = getMissionStatuses(
      wte,
      missionsById,
      currentUserId,
      openMission
    );
    const areAllMissionsValidated = missionsStatus.every(
      (status) =>
        status === MISSION_STATUS.validated
    );

    if (areAllMissionsValidated) {
      return [buildAllValidatedEntry(wte)];
    }

    const entries = missionIds
      .map((missionId) =>
        buildMissionEntry(
          wte,
          missionId,
          missionsById,
          currentUserId,
          openMission,
          mostRecentMissionId
        )
      )
      .filter(Boolean);

    if (entries.length === 0) {
      return [{
        ...wte,
        rest: wte.rest || null,
        service: wte.service || null,
        totalWork: wte.totalWork || null,
        regulationComputations: wte.regulationComputations || null,
        id: wte.user.id + wte.periodStart.toString(),
        workerName: formatPersonName(wte.user),
        statusKey: null,
        selectable: true
      }];
    }

    return entries;
  });
};

const onRowClick = (entry, trackEvent, openWorkday, openMission) => {
  if (!entry.day || trackEvent === null || openWorkday === null || openMission === null) {
    return false;
  }

  trackEvent(OPEN_WORKDAY_DRAWER);

  if (entry.statusKey && entry.statusKey !== MISSION_STATUS.allValidated) {
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
  const weeklyWorkMax = getWeeklyWorkMax(adminStore.business);
  const thresholds = getThresholds(weeklyWorkMax);

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
    name: "rest",
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
    name: "statusKey",
    format: (statusKey, entry) => formatStatus(statusKey, entry, openMission, openWorkday),
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
    minWidth: 120
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
    const withThreshold = period === "week";
    const restCol = {
      label: "Repos",
      name: "maxConsecutiveRest",
      align: "center",
      minWidth: 120,
      flexGrow: 0,
      format: (v) => v != null ? formatTimer(v, false) : null
    };
    const formatWithAlert = (key, formatter) => (v) =>
      v != null ? ThresholdValue({ value: v, formatted: formatter(v), thresholdKey: key, thresholds }) : null;
    const withAlert = (col, key, formatter) => withThreshold
      ? { ...col, format: formatWithAlert(key, formatter) }
      : col;

    columns = [
      employeeCol,
      dailyInfractionsCol,
      weeklyInfractionsCol,
      withAlert(workTimeCol, "work", formatTimer),
      withAlert(restCol, "rest", (v) => formatTimer(v, false)),
      withAlert(workedDaysCol, "workedDays", (v) => v),
      showExpenditures && expenditureCol
    ];
  }

  columns = columns.filter(Boolean);

  const preFormattedWorkTimeEntries = preFormatWorkTimeEntries(
    workTimeEntries,
    missionsById,
    adminStore.userId,
    openMission,
    period
  );

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

InfractionsWaiting.propTypes = {
  tooltipTitle: PropTypes.string.isRequired
};

InfractionsNumber.propTypes = {
  nbAlerts: PropTypes.number
};

const missionStatsPropType = PropTypes.shape({
  breakDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  service: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  totalWorkDuration: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
});

const missionPropType = PropTypes.shape({
  endTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  startTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  name: PropTypes.string,
  userStats: PropTypes.objectOf(missionStatsPropType)
});

const workTimeEntryPropType = PropTypes.shape({
  missionNames: PropTypes.objectOf(PropTypes.string),
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  }).isRequired,
  periodStart: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.number,
    PropTypes.string
  ]).isRequired,
  rest: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  service: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  totalWork: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  regulationComputations: PropTypes.shape({
    nbAlertsDailyAdmin: PropTypes.number
  })
});

WorkTimeTable.propTypes = {
  period: PropTypes.oneOf(["day", "week", "month"]).isRequired,
  workTimeEntries: PropTypes.arrayOf(workTimeEntryPropType).isRequired,
  missionsById: PropTypes.objectOf(missionPropType).isRequired,
  className: PropTypes.string,
  showMissionName: PropTypes.bool,
  showExpenditures: PropTypes.bool,
  loading: PropTypes.bool
};
