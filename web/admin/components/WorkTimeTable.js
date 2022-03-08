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
import { JoinedText } from "./JoinedText";
import { useAdminStore } from "../store/store";
import { WorkDayEndTime } from "./WorkDayEndTime";

const useStyles = makeStyles(theme => ({
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
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
  showExpenditures,
  showMissionName,
  loading,
  width
}) {
  const adminStore = useAdminStore();
  const companies = adminStore.companies;

  const [workdayOnFocus, setWorkdayOnFocus] = React.useState(null);
  const [wordDayDrawerOpen, setWordDayDrawerOpen] = React.useState(false);

  const openMission = useMissionDrawer()[1];

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
    label: "Employé",
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
  const serviceTimeCol = {
    label: "Amplitude",
    name: "service",
    format: formatTimer,
    align: "right",
    minWidth: 100
  };
  const workTimeCol = {
    label: "Temps de travail",
    name: "totalWork",
    sortable: true,
    format: formatTimer,
    align: "right",
    minWidth: 120
  };
  const restTimeCol = {
    label: "Temps de repos",
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
  const missionNamesCol = showMissionName && {
    label: "Mission(s)",
    name: "missionNames",
    format: missionNames => (
      <MissionNamesList missionNames={missionNames} openMission={openMission} />
    ),
    align: "left",
    sortable: true,
    overflowTooltip: true
  };
  const companyNamesCol = companies.length > 1 && {
    label: "Entreprise(s)",
    name: "companyIds",
    format: companyIds => (
      <JoinedText joinWith=", ">
        {companyIds.map(cid => companies.find(c => c.id === cid).name)}
      </JoinedText>
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
      missionNamesCol,
      companyNamesCol,
      startTimeCol,
      endTimeCol,
      serviceTimeCol,
      workTimeCol,
      restTimeCol
    ];
    if (showExpenditures) columns.push(expenditureCol);
    columns.push(pictoCol);
  } else if (period === "week") {
    columns = [employeeCol, workTimeCol, workedDaysCol];
  } else {
    columns = [employeeCol, workTimeCol, workedDaysCol];
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
            width: { md: 885, lg: "100vw" }
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
