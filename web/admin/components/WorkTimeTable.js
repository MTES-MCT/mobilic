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
import { WorkTimeDetails } from "./WorkTimeDetails";
import { ChevronRight } from "@mui/icons-material";
import { SwipeableDrawer } from "@mui/material";
import { MissionNamesList } from "./MissionNamesList";
import { useMissionDrawer } from "./MissionDrawer";
import { WorkDayEndTime } from "./WorkDayEndTime";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { OPEN_WORKDAY_DRAWER } from "common/utils/matomoTags";

const useStyles = makeStyles(theme => ({
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
  loading,
  width
}) {
  const [workdayOnFocus, setWorkdayOnFocus] = React.useState(null);
  const [wordDayDrawerOpen, setWordDayDrawerOpen] = React.useState(false);

  const openMission = useMissionDrawer()[1];

  const { trackEvent } = useMatomo();

  const classes = useStyles();

  let periodLabel, periodFormatter;
  if (period === "day") {
    periodLabel = "Date";
    periodFormatter = textualPrettyFormatDay;
  } else if (period === "week") {
    periodLabel = "Semaine";
    periodFormatter = ts => textualPrettyFormatWeek(getStartOfWeek(ts));
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
    format: time => (time ? formatTimeOfDay(time) : null),
    align: "right",
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
    align: "right",
    minWidth: 100
  };
  const workTimeCol = {
    label: "Travail",
    name: "totalWork",
    sortable: true,
    format: formatTimer,
    align: "right",
    minWidth: 120
  };
  const restTimeCol = {
    label: "Repos",
    name: "rest",
    format: time => (time ? formatTimer(time) : null),
    align: "right",
    minWidth: 100
  };
  const expenditureCol = {
    label: "Frais",
    name: "expenditureAggs",
    format: exps => (exps ? formatExpendituresAsOneString(exps) : null),
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
    format: missionNames => (
      <MissionNamesList missionNames={missionNames} openMission={openMission} />
    ),
    align: "left",
    sortable: true,
    overflowTooltip: true
  };
  const pictoCol = {
    label: "+ d'infos",
    name: "id",
    format: () => <ChevronRight color="primary" />,
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

  const preFormattedWorkTimeEntries = workTimeEntries.map(wte => {
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
      <SwipeableDrawer
        key={0}
        anchor="right"
        open={!!wordDayDrawerOpen}
        onOpen={() => setWordDayDrawerOpen(true)}
        disableDiscovery
        disableSwipeToOpen
        onClose={() => {
          setWordDayDrawerOpen(false);
        }}
        PaperProps={{
          className: classes.workTimeModal,
          sx: {
            width: { xs: "100vw", md: 885 }
          }
        }}
      >
        <WorkTimeDetails
          key={1}
          workTimeEntry={workdayOnFocus}
          openMission={openMission}
          handleClose={() => {
            setWordDayDrawerOpen(false);
          }}
          width={width}
        />
      </SwipeableDrawer>
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
        onRowClick={entry => {
          if (!entry.day) return false;
          trackEvent(OPEN_WORKDAY_DRAWER);
          setWorkdayOnFocus(entry);
          setWordDayDrawerOpen(true);
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
