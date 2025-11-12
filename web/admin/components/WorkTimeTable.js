import React from "react";
import {
  formatTimeOfDay,
  formatTimer,
  getStartOfWeek,
  prettyFormatMonth,
  textualPrettyFormatDay,
  textualPrettyFormatWeek
} from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import { AugmentedTable } from "./AugmentedTable";
import { makeStyles } from "@mui/styles";
import { MissionNamesList } from "./MissionNamesList";
import { useMissionDrawer } from "../drawers/MissionDrawer";
import { WorkDayEndTime } from "./WorkDayEndTime";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { OPEN_WORKDAY_DRAWER } from "common/utils/matomoTags";
import { useDayDrawer } from "../drawers/DayDrawer";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

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

export function WorkTimeTable({
  period,
  workTimeEntries,
  className,
  showMissionName,
  showExpenditures,
  loading
}) {
  const openMission = useMissionDrawer()[1];
  const { openWorkday } = useDayDrawer();

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
  const startTimeCol = {
    label: "Début",
    name: "startTime",
    format: (time) => (time ? formatTimeOfDay(time, false) : null),
    align: "left",
    minWidth: 80
  };
  const endTimeCol = {
    label: "Fin",
    name: "endTime",
    format: (time, entry) => (
      <WorkDayEndTime
        endTime={time}
        dayAggregate={entry}
        openMission={openMission}
      />
    ),
    align: "left",
    minWidth: 100
  };
  const workTimeCol = {
    label: "Travail",
    name: "totalWork",
    sortable: true,
    format: formatTimer,
    align: "left",
    minWidth: 120
  };
  const restTimeCol = {
    label: "Repos",
    name: "rest",
    format: (time) => (time ? formatTimer(time, false) : null),
    align: "left",
    minWidth: 100
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
    format: (missionNames) => (
      <MissionNamesList missionNames={missionNames} openMission={openMission} />
    ),
    align: "left",
    sortable: true,
    overflowTooltip: true
  };
  const pictoCol = {
    label: "+ d'infos",
    name: "id",
    format: () => (
      <span className={cx("fr-icon--sm", "fr-icon-arrow-right-line")} />
    ),
    sortable: false,
    align: "center",
    overflowTooltip: true
  };

  let columns = [];
  if (period === "day") {
    columns = [
      employeeCol,
      showMissionName && missionNamesCol,
      startTimeCol,
      endTimeCol,
      workTimeCol,
      restTimeCol,
      pictoCol
    ];
  } else {
    columns = [
      employeeCol,
      workTimeCol,
      workedDaysCol,
      showExpenditures && expenditureCol
    ];
  }

  columns = columns.filter(Boolean);

  const preFormattedWorkTimeEntries = workTimeEntries.map((wte) => {
    const base = {
      ...wte,
      id: wte.user.id + wte.periodStart.toString(),
      workerName: formatPersonName(wte.user),
      selectable: true
    };
    return base;
  });

  return (
    <>
      <AugmentedTable
        key={2}
        columns={columns}
        entries={preFormattedWorkTimeEntries}
        dense
        virtualizedRowHeight={40}
        defaultSortBy="periodStart"
        defaultSortType="desc"
        className={className}
        virtualized
        onRowClick={(entry) => {
          if (!entry.day) return false;
          trackEvent(OPEN_WORKDAY_DRAWER);
          openWorkday(entry);
        }}
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
